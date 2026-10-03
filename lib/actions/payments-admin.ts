"use server";

// Admin server actions for payments, credit packs and credit adjustments.
// Every action re-checks the ADMIN role in the database (requireAdminId) and
// returns { ok, error } instead of throwing, because Next.js hides thrown
// error messages in production.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/guards";
import { ServiceError } from "@/lib/services/errors";
import { approvePaymentRequest, rejectPaymentRequest, normalizePhone } from "@/lib/payments";
import { adminAdjustCredits, getCreditSummary } from "@/lib/credits";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function run<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (error) {
    if (error instanceof ServiceError) return { ok: false, error: error.message };
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? "Données invalides." };
    console.error("[admin action]", error);
    return { ok: false, error: "Erreur serveur." };
  }
}

// ---- payment settings ------------------------------------------------------

const optionalPhone = z
  .string()
  .transform((v) => normalizePhone(v))
  .refine((v) => v === "" || /^\+?[0-9]{8,15}$/.test(v), "Numéro invalide (8 à 15 chiffres).")
  .transform((v) => (v === "" ? null : v));
const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const paymentSettingsSchema = z.object({
  manualPaymentsEnabled: z.boolean(),
  mtnMomoNumber: optionalPhone,
  mtnMomoAccountName: optionalText(80),
  celtisMoneyNumber: optionalPhone,
  celtisMoneyAccountName: optionalText(80),
  paymentInstructions: optionalText(1000),
  premiumDurationDays: z.number().int().min(1).max(366),
});

export async function updatePaymentSettings(input: z.input<typeof paymentSettingsSchema>) {
  return run(async () => {
    await requireAdminId();
    const data = paymentSettingsSchema.parse(input);
    if (data.manualPaymentsEnabled && !data.mtnMomoNumber && !data.celtisMoneyNumber) {
      throw new ServiceError("NO_NUMBER", "Saisissez au moins un numéro de paiement avant d'ouvrir les paiements.");
    }
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/credits");
    return {};
  });
}

// ---- credit packs ----------------------------------------------------------

const packSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,40}$/, "Code : 3 à 40 caractères (a-z, 0-9, tiret)."),
  name: z.string().trim().min(2, "Nom trop court.").max(60),
  credits: z.number().int().min(1, "Crédits ≥ 1.").max(100000),
  priceXof: z.number().int().min(1, "Prix ≥ 1 FCFA.").max(10000000),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0).max(1000),
});

export async function saveCreditPack(input: z.input<typeof packSchema>) {
  return run(async () => {
    await requireAdminId();
    const { id, ...data } = packSchema.parse(input);
    try {
      if (id) await prisma.creditPack.update({ where: { id }, data });
      else await prisma.creditPack.create({ data });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ServiceError("DUPLICATE_CODE", "Ce code de pack existe déjà.");
      }
      throw error;
    }
    revalidatePath("/admin/credits");
    revalidatePath("/credits");
    return {};
  });
}

// ---- payment requests ------------------------------------------------------

export async function approvePaymentAction(requestId: string) {
  return run(async () => {
    const adminId = await requireAdminId();
    await approvePaymentRequest(adminId, requestId);
    revalidatePath("/admin/payments");
    return {};
  });
}

export async function rejectPaymentAction(requestId: string, reason: string) {
  return run(async () => {
    const adminId = await requireAdminId();
    await rejectPaymentRequest(adminId, requestId, reason);
    revalidatePath("/admin/payments");
    return {};
  });
}

// ---- user credits ----------------------------------------------------------

export async function lookupUserCredits(email: string) {
  return run(async () => {
    await requireAdminId();
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new ServiceError("USER_NOT_FOUND", "Aucun utilisateur avec cet e-mail.", 404);
    const summary = await getCreditSummary(user.id, 15);
    return {
      user,
      balance: summary.balance,
      transactions: summary.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  });
}

const adjustSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().refine((n) => n !== 0, "Montant nul.").refine((n) => Math.abs(n) <= 100000, "Montant trop élevé."),
  reason: z.string().trim().min(5, "Motif obligatoire (5 caractères min.).").max(300),
});

export async function adjustCreditsAction(input: z.input<typeof adjustSchema>) {
  return run(async () => {
    const adminId = await requireAdminId();
    const data = adjustSchema.parse(input);
    const ledger = await adminAdjustCredits({ adminId, ...data });
    revalidatePath("/admin/credits");
    return { balance: ledger.balanceAfter };
  });
}
