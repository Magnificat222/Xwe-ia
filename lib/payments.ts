// Manual commercial payments (MTN Mobile Money / Celtis Money).
//
// Flow: the user pays by hand to the merchant number shown in the app, then
// submits a PaymentRequest (provider + payer phone + transaction reference).
// Nothing is granted until an ADMIN approves it after checking the SMS on the
// merchant account. Amounts are computed here from DB data, never from the
// request body.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { creditUser, TX_OPTIONS } from "@/lib/credits";
import { grantPremiumPeriod } from "@/lib/subscription";
import { ServiceError, isUniqueViolation } from "@/lib/services/errors";

const MAX_PENDING_PER_USER = 3;

export function normalizeReference(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s.-]/g, "");
}

export const createPaymentRequestSchema = z
  .object({
    provider: z.enum(["MTN_MOMO", "CELTIS_MONEY"]),
    purpose: z.enum(["CREDIT_PACK", "PREMIUM"]),
    packCode: z.string().trim().min(1).max(60).optional(),
    payerPhone: z
      .string()
      .transform(normalizePhone)
      .refine((v) => /^\+?[0-9]{8,15}$/.test(v), "Numéro de téléphone invalide."),
    transactionRef: z
      .string()
      .transform(normalizeReference)
      .refine((v) => /^[A-Z0-9._-]{6,40}$/.test(v), "Référence de transaction invalide (6 à 40 caractères)."),
  })
  .superRefine((value, ctx) => {
    if (value.purpose === "CREDIT_PACK" && !value.packCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["packCode"], message: "Choisissez un pack de crédits." });
    }
  });

export type CreatePaymentRequestInput = z.infer<typeof createPaymentRequestSchema>;

// Public (authenticated) payment configuration: numbers and active packs.
export async function getPaymentConfig() {
  const settings = await getSiteSettings();
  const packs = await prisma.creditPack.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { priceXof: "asc" }],
    select: { code: true, name: true, credits: true, priceXof: true },
  });
  return {
    enabled: settings.manualPaymentsEnabled,
    premiumPriceXof: settings.premiumPriceXof,
    instructions: settings.paymentInstructions ?? null,
    providers: [
      { provider: "MTN_MOMO" as const, number: settings.mtnMomoNumber ?? null, accountName: settings.mtnMomoAccountName ?? null },
      { provider: "CELTIS_MONEY" as const, number: settings.celtisMoneyNumber ?? null, accountName: settings.celtisMoneyAccountName ?? null },
    ].filter((p) => p.number),
    packs,
  };
}

export async function createPaymentRequest(userId: string, input: CreatePaymentRequestInput) {
  const settings = await getSiteSettings();
  if (!settings.manualPaymentsEnabled) {
    throw new ServiceError("PAYMENTS_DISABLED", "Les paiements ne sont pas encore ouverts.", 403);
  }
  const providerNumber = input.provider === "MTN_MOMO" ? settings.mtnMomoNumber : settings.celtisMoneyNumber;
  if (!providerNumber) {
    throw new ServiceError("PROVIDER_NOT_CONFIGURED", "Ce moyen de paiement n'est pas disponible.", 409);
  }

  const pending = await prisma.paymentRequest.count({ where: { userId, status: "PENDING" } });
  if (pending >= MAX_PENDING_PER_USER) {
    throw new ServiceError(
      "TOO_MANY_PENDING",
      "Vous avez déjà plusieurs demandes en attente de validation.",
      429
    );
  }

  let amountXof: number;
  let creditAmount: number | null = null;
  let premiumMonths: number | null = null;
  let packId: string | null = null;

  if (input.purpose === "CREDIT_PACK") {
    const pack = await prisma.creditPack.findUnique({ where: { code: input.packCode! } });
    if (!pack || !pack.isActive) {
      throw new ServiceError("PACK_NOT_FOUND", "Ce pack de crédits n'est pas disponible.", 404);
    }
    amountXof = pack.priceXof;
    creditAmount = pack.credits;
    packId = pack.id;
  } else {
    amountXof = settings.premiumPriceXof;
    premiumMonths = 1;
  }

  try {
    return await prisma.paymentRequest.create({
      data: {
        userId,
        purpose: input.purpose,
        provider: input.provider,
        packId,
        amountXof,
        creditAmount,
        premiumMonths,
        payerPhone: input.payerPhone,
        transactionRef: input.transactionRef,
      },
      select: { id: true, status: true, amountXof: true, creditAmount: true, purpose: true, createdAt: true },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ServiceError(
        "DUPLICATE_REFERENCE",
        "Cette référence de transaction a déjà été soumise.",
        409
      );
    }
    throw error;
  }
}

export async function listUserPaymentRequests(userId: string) {
  return prisma.paymentRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      purpose: true,
      provider: true,
      amountXof: true,
      creditAmount: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      reviewedAt: true,
    },
  });
}

// Approve: the PENDING -> APPROVED claim is a single conditional UPDATE, so a
// request can be approved once only, even with two admins clicking together.
// The claim, the ledger line / Premium extension all commit or roll back
// together. PaymentRequest.transaction is also unique, as a second guard.
export async function approvePaymentRequest(adminId: string, requestId: string) {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.paymentRequest.updateMany({
      where: { id: requestId, status: "PENDING" },
      data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date() },
    });
    if (claimed.count === 0) {
      throw new ServiceError("NOT_PENDING", "Cette demande n'existe pas ou a déjà été traitée.", 409);
    }

    const request = await tx.paymentRequest.findUniqueOrThrow({ where: { id: requestId } });
    if (!request.userId) {
      throw new ServiceError("USER_DELETED", "Le compte de l'utilisateur n'existe plus.", 409);
    }

    if (request.purpose === "CREDIT_PACK") {
      if (!request.creditAmount || request.creditAmount <= 0) {
        throw new ServiceError("INVALID_REQUEST", "Demande sans montant de crédits.", 409);
      }
      await creditUser(tx, {
        userId: request.userId,
        amount: request.creditAmount,
        type: "PURCHASE",
        description: `Achat de crédits (${request.provider} ${request.transactionRef})`,
        idempotencyKey: `payment:${request.id}`,
        paymentRequestId: request.id,
        createdById: adminId,
      });
    } else {
      const settings = await tx.siteSettings.findUnique({ where: { id: "singleton" } });
      const days = (settings?.premiumDurationDays ?? 31) * (request.premiumMonths ?? 1);
      // Extends from the current end when still active, otherwise from now
      // (row locked, see grantPremiumPeriod).
      await grantPremiumPeriod(tx, request.userId, days);
    }

    return request;
  }, TX_OPTIONS);
}

export async function rejectPaymentRequest(adminId: string, requestId: string, reason: string) {
  const cleaned = reason.trim();
  if (cleaned.length < 3) {
    throw new ServiceError("REASON_REQUIRED", "Indiquez un motif de refus.", 400);
  }
  const result = await prisma.paymentRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "REJECTED", reviewedById: adminId, reviewedAt: new Date(), rejectionReason: cleaned },
  });
  if (result.count === 0) {
    throw new ServiceError("NOT_PENDING", "Cette demande n'existe pas ou a déjà été traitée.", 409);
  }
  return { rejected: true };
}
