"use server";

import { revalidatePath } from "next/cache";
import { eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  aiQuotas,
  auditLogs,
  pathways,
  paymentNumbers,
  premiumBenefits,
  priceHistory,
  promotions,
  siteSettings,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { confirmOrder, rejectOrder, reviewOrder } from "@/lib/services/orders";
import type { ActionState } from "./auth";

async function logAction(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(auditLogs).values({ actorId, action, entity, entityId, metadata });
}

/* ---------------------------- Commandes ----------------------------- */

/** Confirme un paiement : ouvre l'accès via le service de commande. */
export async function confirmOrderAction(orderId: string, note?: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  const result = await confirmOrder(orderId, admin.id, note);
  if (!result.ok) return { error: result.error };

  await logAction(admin.id, "order.confirm", "order", orderId);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin/paiements");
  return { success: "Paiement confirmé, l'accès est ouvert." };
}

export async function rejectOrderAction(orderId: string, reason: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  if (reason.trim().length < 3) return { error: "Indique un motif." };

  const result = await rejectOrder(orderId, admin.id, reason.trim());
  if (!result.ok) return { error: result.error };

  await logAction(admin.id, "order.reject", "order", orderId, { reason });
  revalidatePath("/admin/commandes");
  return { success: "Commande refusée, l'utilisateur est prévenu." };
}

export async function reviewOrderAction(orderId: string, note: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  if (note.trim().length < 3) return { error: "Indique ce qui doit être vérifié." };

  const result = await reviewOrder(orderId, admin.id, note.trim());
  if (!result.ok) return { error: result.error };

  await logAction(admin.id, "order.review", "order", orderId);
  revalidatePath("/admin/commandes");
  return { success: "Commande placée en vérification." };
}

/* ------------------------- Numéros de paiement ----------------------- */

export async function savePaymentNumberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const id = String(formData.get("id") ?? "");
  const number = String(formData.get("number") ?? "").trim();
  const label = String(formData.get("label") ?? "MTN MoMo").trim();
  const holderName = String(formData.get("holderName") ?? "").trim();
  const isPrimary = formData.get("isPrimary") === "on";
  const isActive = formData.get("isActive") === "on";
  const position = Number(formData.get("position") ?? 0);

  if (number.replace(/[^\d+]/g, "").length < 8) {
    return { fieldErrors: { number: "Numéro invalide." } };
  }

  const values = {
    label: label || "MTN MoMo",
    number,
    holderName: holderName || null,
    isPrimary,
    isActive,
    position: Number.isFinite(position) ? position : 0,
    updatedAt: new Date(),
  };

  const saved = id
    ? await db.update(paymentNumbers).set(values).where(eq(paymentNumbers.id, id)).returning({ id: paymentNumbers.id })
    : await db.insert(paymentNumbers).values(values).returning({ id: paymentNumbers.id });

  // Un seul numéro principal : on rétrograde les autres.
  if (isPrimary && saved[0]) {
    await db
      .update(paymentNumbers)
      .set({ isPrimary: false })
      .where(ne(paymentNumbers.id, saved[0].id));
  }

  await logAction(admin.id, id ? "payment_number.update" : "payment_number.create", "payment_number", saved[0]?.id);
  revalidatePath("/admin/paiements");
  return { success: "Numéro enregistré." };
}

export async function togglePaymentNumberAction(id: string, active: boolean): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db
    .update(paymentNumbers)
    .set({ isActive: active, updatedAt: new Date() })
    .where(eq(paymentNumbers.id, id));

  await logAction(admin.id, "payment_number.toggle", "payment_number", id, { active });
  revalidatePath("/admin/paiements");
  return { success: active ? "Numéro activé." : "Numéro désactivé." };
}

export async function deletePaymentNumberAction(id: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db.delete(paymentNumbers).where(eq(paymentNumbers.id, id));
  await logAction(admin.id, "payment_number.delete", "payment_number", id);
  revalidatePath("/admin/paiements");
  return { success: "Numéro supprimé." };
}

/* ----------------------------- Promotions ---------------------------- */

export async function savePromotionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const pathwayId = String(formData.get("pathwayId") ?? "");
  const appliesToPremium = formData.get("appliesToPremium") === "on";
  const discountType = String(formData.get("discountType") ?? "percent") as
    | "percent"
    | "amount"
    | "fixed_price";
  const discountValue = Number(formData.get("discountValue") ?? 0);
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  const maxRedemptions = String(formData.get("maxRedemptions") ?? "");
  const isActive = formData.get("isActive") === "on";

  const fieldErrors: Record<string, string> = {};
  if (label.length < 3) fieldErrors.label = "Donne un intitulé clair.";
  if (!Number.isFinite(discountValue) || discountValue < 0) {
    fieldErrors.discountValue = "Valeur invalide.";
  }
  if (discountType === "percent" && discountValue > 100) {
    fieldErrors.discountValue = "Un pourcentage ne dépasse pas 100.";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const values = {
    label,
    code: code || null,
    // Une promotion Premium ne cible pas de parcours, et inversement.
    pathwayId: appliesToPremium || !pathwayId ? null : pathwayId,
    appliesToPremium,
    discountType,
    discountValue: Math.round(discountValue),
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
    isActive,
    createdBy: admin.id,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(promotions).set(values).where(eq(promotions.id, id));
  } else {
    await db.insert(promotions).values(values);
  }

  await logAction(admin.id, id ? "promotion.update" : "promotion.create", "promotion", id || undefined, {
    label,
    discountType,
    discountValue,
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/parcours");
  revalidatePath("/tarifs");
  return { success: "Promotion enregistrée." };
}

export async function togglePromotionAction(id: string, active: boolean): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db
    .update(promotions)
    .set({ isActive: active, updatedAt: new Date() })
    .where(eq(promotions.id, id));

  await logAction(admin.id, "promotion.toggle", "promotion", id, { active });
  revalidatePath("/admin/promotions");
  revalidatePath("/parcours");
  return { success: active ? "Promotion activée." : "Promotion désactivée." };
}

export async function deletePromotionAction(id: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db.delete(promotions).where(eq(promotions.id, id));
  await logAction(admin.id, "promotion.delete", "promotion", id);
  revalidatePath("/admin/promotions");
  return { success: "Promotion supprimée." };
}

/* -------------------------------- Prix ------------------------------- */

/** Modifie le prix d'un parcours en conservant la trace du changement. */
export async function updatePathwayPriceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const pathwayId = String(formData.get("pathwayId") ?? "");
  const newPrice = Number(formData.get("priceXof") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!Number.isFinite(newPrice) || newPrice < 0) {
    return { fieldErrors: { priceXof: "Prix invalide." } };
  }

  const rows = await db
    .select({ priceXof: pathways.priceXof, accessType: pathways.accessType })
    .from(pathways)
    .where(eq(pathways.id, pathwayId))
    .limit(1);

  const pathway = rows[0];
  if (!pathway) return { error: "Parcours introuvable." };
  if (pathway.accessType !== "paid") {
    return { error: "Ce parcours n'est pas en vente à l'unité : change son type d'accès d'abord." };
  }

  await db
    .update(pathways)
    .set({ priceXof: Math.round(newPrice), updatedAt: new Date() })
    .where(eq(pathways.id, pathwayId));

  await db.insert(priceHistory).values({
    pathwayId,
    scope: "pathway",
    oldPriceXof: pathway.priceXof,
    newPriceXof: Math.round(newPrice),
    reason: reason || null,
    changedBy: admin.id,
  });

  await logAction(admin.id, "pathway.price", "pathway", pathwayId, {
    from: pathway.priceXof,
    to: newPrice,
  });

  revalidatePath("/admin/prix");
  revalidatePath("/parcours");
  revalidatePath("/tarifs");
  return { success: "Prix mis à jour." };
}

/** Modifie le prix de l'abonnement Premium. */
export async function updatePremiumPriceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const newPrice = Number(formData.get("premiumPriceXof") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();

  if (!Number.isFinite(newPrice) || newPrice < 0) {
    return { fieldErrors: { premiumPriceXof: "Prix invalide." } };
  }

  const current = await db
    .select({ premiumPriceXof: siteSettings.premiumPriceXof })
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1);

  const oldPrice = current[0]?.premiumPriceXof ?? 5500;

  await db
    .insert(siteSettings)
    .values({ id: "singleton", premiumPriceXof: Math.round(newPrice) })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { premiumPriceXof: Math.round(newPrice), updatedAt: new Date() },
    });

  await db.insert(priceHistory).values({
    scope: "premium",
    oldPriceXof: oldPrice,
    newPriceXof: Math.round(newPrice),
    reason: reason || null,
    changedBy: admin.id,
  });

  await logAction(admin.id, "premium.price", "settings", "singleton", {
    from: oldPrice,
    to: newPrice,
  });

  revalidatePath("/admin/prix");
  revalidatePath("/premium");
  revalidatePath("/tarifs");
  return { success: "Prix Premium mis à jour." };
}

/* -------------------------- Avantages Premium ------------------------ */

export async function savePremiumBenefitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "Sparkles");
  const position = Number(formData.get("position") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (label.length < 3) return { fieldErrors: { label: "Intitulé trop court." } };

  const values = {
    label,
    description,
    icon,
    position: Number.isFinite(position) ? position : 0,
    isActive,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(premiumBenefits).set(values).where(eq(premiumBenefits.id, id));
  } else {
    await db.insert(premiumBenefits).values(values);
  }

  await logAction(admin.id, id ? "premium_benefit.update" : "premium_benefit.create", "premium_benefit", id || undefined);
  revalidatePath("/admin/premium");
  revalidatePath("/premium");
  revalidatePath("/tarifs");
  return { success: "Avantage enregistré." };
}

export async function deletePremiumBenefitAction(id: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db.delete(premiumBenefits).where(eq(premiumBenefits.id, id));
  await logAction(admin.id, "premium_benefit.delete", "premium_benefit", id);
  revalidatePath("/admin/premium");
  revalidatePath("/premium");
  return { success: "Avantage supprimé." };
}

/* ------------------------------- Quotas IA --------------------------- */

/**
 * Ajuste les quotas d'IA d'une formule.
 *
 * Les limites protègent le budget : elles sont donc modifiables sans
 * redéploiement, mais restent bornées pour éviter une saisie accidentelle
 * qui ouvrirait la porte à une facture incontrôlée.
 */
export async function updateAiQuotaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const id = String(formData.get("id") ?? "");
  const dailyLimit = Number(formData.get("dailyLimit") ?? 0);
  const monthlyLimit = Number(formData.get("monthlyLimit") ?? 0);
  const isEnabled = formData.get("isEnabled") === "on";

  if (!id) return { error: "Quota introuvable." };
  if (!Number.isFinite(dailyLimit) || dailyLimit < 0 || dailyLimit > 10000) {
    return { fieldErrors: { dailyLimit: "Limite journalière invalide (0 à 10000)." } };
  }
  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0 || monthlyLimit > 200000) {
    return { fieldErrors: { monthlyLimit: "Limite mensuelle invalide (0 à 200000)." } };
  }
  if (monthlyLimit < dailyLimit) {
    return { fieldErrors: { monthlyLimit: "Le plafond mensuel doit couvrir au moins un jour." } };
  }

  await db
    .update(aiQuotas)
    .set({
      dailyLimit: Math.round(dailyLimit),
      monthlyLimit: Math.round(monthlyLimit),
      isEnabled,
      updatedAt: new Date(),
    })
    .where(eq(aiQuotas.id, id));

  await logAction(admin.id, "ai_quota.update", "ai_quota", id, {
    dailyLimit,
    monthlyLimit,
    isEnabled,
  });

  revalidatePath("/admin/ia");
  return { success: "Quota mis à jour." };
}
