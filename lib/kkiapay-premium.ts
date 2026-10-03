// Turns a Kkiapay payment into ONE Premium period, exactly once.
//
// Nothing coming from the browser is proof of payment: the browser only gives
// us a transactionId, and everything else is checked here, server-side:
//   1. the transaction is fetched from Kkiapay with our private keys;
//   2. status === "SUCCESS";
//   3. amount === the Premium price stored in the database (exact match);
//   4. the transaction belongs to the logged-in user (the widget was opened
//      with data = user id, Kkiapay echoes it back);
//   5. the transactionId has never been processed (UNIQUE index).
// The KkiapayTransaction row and the Premium extension are written in ONE DB
// transaction: either both exist or neither does. Two simultaneous requests
// for the same transactionId collide on the unique index; only one wins.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { kkiapayClient } from "@/lib/kkiapay";
import { getSiteSettings } from "@/lib/settings";
import { TX_OPTIONS } from "@/lib/credits";
import { grantPremiumPeriod, PREMIUM_PERIOD_DAYS } from "@/lib/subscription";
import { ServiceError, isUniqueViolation } from "@/lib/services/errors";

const transactionIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_-]+$/);

export type KkiapayGrantResult = { activated: true; alreadyProcessed: boolean };

async function resolveExisting(transactionId: string, userId: string): Promise<KkiapayGrantResult> {
  const existing = await prisma.kkiapayTransaction.findUnique({
    where: { transactionId },
    select: { userId: true },
  });
  // Same user retrying (double click, page reload): idempotent success, NO new extension.
  if (existing && existing.userId === userId) return { activated: true, alreadyProcessed: true };
  throw new ServiceError("TRANSACTION_ALREADY_USED", "Cette transaction a déjà été utilisée.", 409);
}

// The Kkiapay SDK types are loose; read only what we need, defensively.
function readTransaction(raw: unknown) {
  const t = (raw ?? {}) as Record<string, unknown>;
  const reference = typeof t.state === "string" ? t.state : typeof t.data === "string" ? t.data : null;
  const currency = typeof t.currency === "string" ? t.currency.toUpperCase() : null;
  return {
    status: typeof t.status === "string" ? t.status : null,
    amount: Number(t.amount),
    reference,
    currency,
  };
}

export async function verifyAndGrantKkiapayPremium(
  userId: string,
  rawTransactionId: unknown
): Promise<KkiapayGrantResult> {
  const parsedId = transactionIdSchema.safeParse(rawTransactionId);
  if (!parsedId.success) {
    throw new ServiceError("INVALID_TRANSACTION", "Identifiant de transaction invalide.", 400);
  }
  const transactionId = parsedId.data;

  // Already processed? Answer from the database, without calling Kkiapay.
  const known = await prisma.kkiapayTransaction.findUnique({ where: { transactionId }, select: { id: true } });
  if (known) return resolveExisting(transactionId, userId);

  // 1. Server-side verification with Kkiapay.
  let raw: unknown;
  try {
    raw = await kkiapayClient.verify(transactionId);
  } catch (error) {
    console.error("[kkiapay] verify call failed", { transactionId, message: (error as Error)?.message });
    throw new ServiceError("VERIFY_UNAVAILABLE", "Impossible de vérifier la transaction pour le moment.", 502);
  }
  const tx = readTransaction(raw);

  // 2. Status.
  if (tx.status !== "SUCCESS") {
    throw new ServiceError("PAYMENT_NOT_CONFIRMED", "Paiement non confirmé.", 400);
  }

  // 3. Amount: must equal the Premium price from the database, exactly.
  const settings = await getSiteSettings();
  const expectedAmount = settings.premiumPriceXof;
  if (!Number.isInteger(expectedAmount) || expectedAmount <= 0) {
    console.error("[kkiapay] invalid premium price in settings", { expectedAmount });
    throw new ServiceError("PRICE_NOT_CONFIGURED", "Le prix Premium n'est pas configuré.", 409);
  }
  if (tx.amount !== expectedAmount || (tx.currency !== null && tx.currency !== "XOF")) {
    console.error("[kkiapay] amount mismatch", { transactionId, paid: tx.amount, expected: expectedAmount, currency: tx.currency });
    throw new ServiceError("AMOUNT_MISMATCH", "Le montant du paiement ne correspond pas à l'offre Premium.", 400);
  }

  // 4. Ownership. Fail closed when Kkiapay returns no reference at all.
  if (tx.reference === null) {
    console.error("[kkiapay] verified transaction carries no user reference (state/data missing)", { transactionId });
    throw new ServiceError("OWNER_UNVERIFIABLE", "Impossible de rattacher cette transaction à votre compte.", 403);
  }
  if (tx.reference !== userId) {
    console.error("[kkiapay] transaction belongs to another user", { transactionId });
    throw new ServiceError("OWNER_MISMATCH", "Cette transaction n'est pas associée à votre compte.", 403);
  }

  // 5. Atomic: burn the transactionId AND extend Premium, or neither.
  const days = settings.premiumDurationDays > 0 ? settings.premiumDurationDays : PREMIUM_PERIOD_DAYS;
  try {
    await prisma.$transaction(async (db) => {
      await db.kkiapayTransaction.create({
        data: { transactionId, userId, amountXof: expectedAmount, premiumDays: days },
      });
      await grantPremiumPeriod(db, userId, days);
    }, TX_OPTIONS);
  } catch (error) {
    // A concurrent request inserted the same transactionId first: it already
    // granted Premium (our transaction rolled back, nothing was extended).
    if (isUniqueViolation(error)) return resolveExisting(transactionId, userId);
    throw error;
  }

  return { activated: true, alreadyProcessed: false };
}
