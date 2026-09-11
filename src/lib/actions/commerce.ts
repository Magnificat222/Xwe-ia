"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, pathways } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import {
  cancelOrder,
  createOrder,
  declarePayment,
  getOrderInstructions,
} from "@/lib/services/orders";
import type { ActionState } from "./auth";

/**
 * Actions commerciales côté utilisateur.
 *
 * Aucune ne reçoit de montant : le prix est toujours recalculé en base par le
 * service de commande. Le navigateur ne transmet que des identifiants.
 */

/** Ouvre une commande pour un parcours ou pour Premium. */
export async function createOrderAction(
  kind: "pathway" | "premium",
  pathwaySlug?: string,
): Promise<{ ok: boolean; orderId?: string; reference?: string; error?: string }> {
  const session = await requireUser("/parcours");

  let pathwayId: string | undefined;
  if (kind === "pathway") {
    if (!pathwaySlug) return { ok: false, error: "Parcours manquant." };
    const rows = await db
      .select({ id: pathways.id })
      .from(pathways)
      .where(eq(pathways.slug, pathwaySlug))
      .limit(1);
    if (!rows[0]) return { ok: false, error: "Parcours introuvable." };
    pathwayId = rows[0].id;
  }

  const result = await createOrder({ userId: session.id, kind, pathwayId });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/achats");
  return { ok: true, orderId: result.orderId, reference: result.reference };
}

/** Instructions de paiement (numéros, étapes, délai) pour une commande. */
export async function getOrderInstructionsAction(orderId: string) {
  const session = await requireUser("/achats");

  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  // On ne divulgue jamais la commande d'un autre membre.
  if (!rows[0] || rows[0].userId !== session.id) return null;

  const result = await getOrderInstructions(orderId);
  if (!result) return null;

  return {
    reference: result.order.reference,
    amountXof: result.order.amountXof,
    listPriceXof: result.order.listPriceXof,
    status: result.order.status,
    instruction: result.instruction,
    error: result.error,
  };
}

/** Déclaration de paiement par l'utilisateur. N'ouvre aucun accès. */
export async function declarePaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser("/achats");

  const orderId = String(formData.get("orderId") ?? "");
  const payerNumber = String(formData.get("payerNumber") ?? "").trim();
  const declaredReference = String(formData.get("declaredReference") ?? "").trim();
  const declaredAmountRaw = String(formData.get("declaredAmountXof") ?? "").replace(/\s/g, "");
  const payeeNumber = String(formData.get("payeeNumber") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  // Un numéro béninois fait 8 chiffres, éventuellement précédé de l'indicatif.
  const digits = payerNumber.replace(/[^\d]/g, "");
  if (digits.length < 8) fieldErrors.payerNumber = "Indique le numéro utilisé pour payer.";
  if (declaredReference.length < 4) {
    fieldErrors.declaredReference = "Recopie l'identifiant de la transaction reçu par SMS.";
  }

  const declaredAmountXof = Number(declaredAmountRaw);
  if (!Number.isFinite(declaredAmountXof) || declaredAmountXof <= 0) {
    fieldErrors.declaredAmountXof = "Indique le montant envoyé.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const result = await declarePayment({
    orderId,
    userId: session.id,
    payerNumber,
    declaredAmountXof,
    declaredReference,
    payeeNumber: payeeNumber || undefined,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/achats");
  return {
    success:
      "Déclaration enregistrée. Nous vérifions le paiement et t'ouvrons l'accès dès validation.",
  };
}

/** Annulation d'une commande par son auteur. */
export async function cancelOrderAction(orderId: string): Promise<ActionState> {
  const session = await requireUser("/achats");
  const result = await cancelOrder(orderId, session.id);
  if (!result.ok) return { error: result.error };

  revalidatePath("/achats");
  return { success: "Commande annulée." };
}
