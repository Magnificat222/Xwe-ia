// Xwé Crédits — the ONLY module allowed to change CreditAccount.balance.
//
// Guarantees:
//  - every balance change writes a CreditTransaction in the SAME DB transaction;
//  - debits are a single conditional UPDATE (balance >= cost), so two parallel
//    requests can never spend the same credits;
//  - amounts come from server-side data, never from the client;
//  - the DB additionally enforces balance >= 0 and an append-only ledger.
import type { Prisma, CreditTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/errors";

export type Tx = Prisma.TransactionClient;

export const TX_OPTIONS = { maxWait: 5000, timeout: 10000 } as const;

function assertPositiveInt(amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new ServiceError("INVALID_AMOUNT", "Montant invalide.", 400);
  }
}

export async function ensureCreditAccount(tx: Tx, userId: string) {
  const existing = await tx.creditAccount.findUnique({ where: { userId } });
  if (existing) return existing;

  const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) throw new ServiceError("USER_NOT_FOUND", "Utilisateur introuvable.", 404);

  return tx.creditAccount.upsert({
    where: { userId },
    update: {},
    create: { userId, ownerEmail: user.email },
  });
}

type LedgerMeta = {
  description?: string;
  reason?: string;
  idempotencyKey?: string;
  paymentRequestId?: string;
  learningPathId?: string;
  createdById?: string;
};

// Adds credits. Must be called inside prisma.$transaction.
export async function creditUser(
  tx: Tx,
  input: {
    userId: string;
    amount: number; // positive
    type: Extract<CreditTransactionType, "PURCHASE" | "ADMIN_CREDIT" | "REFUND">;
  } & LedgerMeta
) {
  assertPositiveInt(input.amount);
  const account = await ensureCreditAccount(tx, input.userId);

  const updated = await tx.creditAccount.update({
    where: { id: account.id },
    data: { balance: { increment: input.amount } },
    select: { balance: true },
  });

  return tx.creditTransaction.create({
    data: {
      accountId: account.id,
      type: input.type,
      amount: input.amount,
      balanceAfter: updated.balance,
      description: input.description,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
      paymentRequestId: input.paymentRequestId,
      learningPathId: input.learningPathId,
      createdById: input.createdById,
    },
  });
}

// Removes credits. Must be called inside prisma.$transaction.
// Throws INSUFFICIENT_CREDITS when the balance is too low; nothing is written.
export async function debitUser(
  tx: Tx,
  input: {
    userId: string;
    amount: number; // positive cost; stored as a negative ledger line
    type: Extract<CreditTransactionType, "SPEND" | "ADMIN_DEBIT">;
  } & LedgerMeta
) {
  assertPositiveInt(input.amount);
  const account = await ensureCreditAccount(tx, input.userId);

  // Atomic "check and subtract": the row is locked by this UPDATE, so a
  // concurrent debit waits, then re-evaluates balance >= amount.
  const result = await tx.creditAccount.updateMany({
    where: { id: account.id, balance: { gte: input.amount } },
    data: { balance: { decrement: input.amount } },
  });
  if (result.count === 0) {
    throw new ServiceError("INSUFFICIENT_CREDITS", "Solde de Xwé Crédits insuffisant.", 402);
  }

  const fresh = await tx.creditAccount.findUniqueOrThrow({
    where: { id: account.id },
    select: { balance: true },
  });

  return tx.creditTransaction.create({
    data: {
      accountId: account.id,
      type: input.type,
      amount: -input.amount,
      balanceAfter: fresh.balance,
      description: input.description,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
      paymentRequestId: input.paymentRequestId,
      learningPathId: input.learningPathId,
      createdById: input.createdById,
    },
  });
}

export async function getCreditSummary(userId: string, take = 20) {
  const account = await prisma.creditAccount.findUnique({
    where: { userId },
    select: {
      balance: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          type: true,
          amount: true,
          balanceAfter: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });
  return { balance: account?.balance ?? 0, transactions: account?.transactions ?? [] };
}

// Admin-only manual adjustment (caller must have passed requireAdminId()).
// `amount` is signed: > 0 credits the user, < 0 debits. A reason is mandatory.
export async function adminAdjustCredits(input: {
  adminId: string;
  userId: string;
  amount: number;
  reason: string;
}) {
  const reason = input.reason.trim();
  if (reason.length < 5) {
    throw new ServiceError("REASON_REQUIRED", "Un motif d'au moins 5 caractères est obligatoire.", 400);
  }
  if (!Number.isSafeInteger(input.amount) || input.amount === 0) {
    throw new ServiceError("INVALID_AMOUNT", "Montant invalide.", 400);
  }

  return prisma.$transaction(async (tx) => {
    if (input.amount > 0) {
      return creditUser(tx, {
        userId: input.userId,
        amount: input.amount,
        type: "ADMIN_CREDIT",
        reason,
        description: "Ajustement manuel (administrateur)",
        createdById: input.adminId,
      });
    }
    return debitUser(tx, {
      userId: input.userId,
      amount: -input.amount,
      type: "ADMIN_DEBIT",
      reason,
      description: "Ajustement manuel (administrateur)",
      createdById: input.adminId,
    });
  }, TX_OPTIONS);
}

// Audit helper: the stored balance must equal the sum of the ledger.
export async function reconcileBalance(userId: string) {
  const account = await prisma.creditAccount.findUnique({ where: { userId }, select: { id: true, balance: true } });
  if (!account) return { ok: true, balance: 0, ledgerSum: 0 };
  const agg = await prisma.creditTransaction.aggregate({
    where: { accountId: account.id },
    _sum: { amount: true },
  });
  const ledgerSum = agg._sum.amount ?? 0;
  return { ok: ledgerSum === account.balance, balance: account.balance, ledgerSum };
}
