import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  notifications,
  orderEvents,
  orders,
  pathways,
  payments,
  purchases,
  subscriptions,
} from "@/db/schema";
import type { OrderStatus } from "@/db/schema";
import { generateOrderReference, getPaymentProvider } from "@/lib/payments";
import { quotePathway, quotePremium, redeemPromotion } from "@/lib/pricing";

/**
 * Service de commande.
 *
 * C'est le seul endroit du produit qui ouvre un accès payant. Les actions
 * serveur et l'administration passent obligatoirement par lui, ce qui garantit
 * qu'une confirmation produit toujours les mêmes effets : achat enregistré,
 * accès ouvert, notification envoyée, événement journalisé.
 */

/** Durée de validité d'une commande non payée. */
const ORDER_TTL_HOURS = 72;

async function recordEvent(
  orderId: string,
  status: OrderStatus,
  note?: string,
  actorId?: string,
): Promise<void> {
  await db.insert(orderEvents).values({ orderId, status, note, actorId });
}

/** Référence unique, avec quelques tentatives en cas de collision. */
async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const reference = generateOrderReference();
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.reference, reference))
      .limit(1);
    if (!existing[0]) return reference;
  }
  // Repli : on suffixe par l'horloge, la collision devient impossible.
  return `${generateOrderReference()}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

export interface CreateOrderInput {
  userId: string;
  kind: "pathway" | "premium";
  pathwayId?: string;
}

export type CreateOrderResult =
  | { ok: true; orderId: string; reference: string; amountXof: number }
  | { ok: false; error: string };

/**
 * Crée une commande.
 *
 * Le montant est calculé ici, en base, à partir du catalogue et des
 * promotions. Rien de ce que le navigateur envoie n'influence le prix.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  let listPriceXof = 0;
  let amountXof = 0;
  let promotionId: string | null = null;

  if (input.kind === "pathway") {
    if (!input.pathwayId) return { ok: false, error: "Parcours manquant." };

    const rows = await db
      .select({
        id: pathways.id,
        accessType: pathways.accessType,
        isPublished: pathways.isPublished,
      })
      .from(pathways)
      .where(eq(pathways.id, input.pathwayId))
      .limit(1);

    const pathway = rows[0];
    if (!pathway || !pathway.isPublished) return { ok: false, error: "Parcours introuvable." };
    if (pathway.accessType !== "paid") {
      return { ok: false, error: "Ce parcours ne s'achète pas à l'unité." };
    }

    // Possède-t-il déjà ce parcours ? On ne fait pas payer deux fois.
    const owned = await db
      .select({ id: purchases.id })
      .from(purchases)
      .where(
        and(eq(purchases.userId, input.userId), eq(purchases.pathwayId, input.pathwayId)),
      )
      .limit(1);
    if (owned[0]) return { ok: false, error: "Tu possèdes déjà ce parcours." };

    const quote = await quotePathway(input.pathwayId);
    if (!quote) return { ok: false, error: "Parcours introuvable." };
    listPriceXof = quote.listPriceXof;
    amountXof = quote.amountXof;
    promotionId = quote.promotion?.id ?? null;
  } else {
    const quote = await quotePremium();
    listPriceXof = quote.listPriceXof;
    amountXof = quote.amountXof;
    promotionId = quote.promotion?.id ?? null;
  }

  // Une commande identique déjà ouverte ? On la réutilise plutôt que
  // d'empiler des références que l'utilisateur ne saura plus distinguer.
  const existing = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, input.userId),
        eq(orders.kind, input.kind),
        input.pathwayId ? eq(orders.pathwayId, input.pathwayId) : eq(orders.kind, input.kind),
        eq(orders.status, "awaiting_payment"),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (existing[0] && (!existing[0].expiresAt || existing[0].expiresAt > new Date())) {
    return {
      ok: true,
      orderId: existing[0].id,
      reference: existing[0].reference,
      amountXof: existing[0].amountXof,
    };
  }

  const reference = await uniqueReference();
  const expiresAt = new Date(Date.now() + ORDER_TTL_HOURS * 3600 * 1000);

  const [order] = await db
    .insert(orders)
    .values({
      reference,
      userId: input.userId,
      kind: input.kind,
      pathwayId: input.pathwayId ?? null,
      status: "awaiting_payment",
      listPriceXof,
      amountXof,
      promotionId,
      expiresAt,
    })
    .returning({ id: orders.id });

  await recordEvent(order.id, "awaiting_payment", "Commande créée.", input.userId);

  return { ok: true, orderId: order.id, reference, amountXof };
}

/** Instructions de paiement pour une commande, via le fournisseur actif. */
export async function getOrderInstructions(orderId: string) {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return null;

  const provider = getPaymentProvider();
  const result = await provider.initiate({
    orderId: order.id,
    reference: order.reference,
    amountXof: order.amountXof,
    userId: order.userId,
    label: order.kind === "premium" ? "Abonnement Premium" : "Parcours",
  });

  return { order, provider: provider.id, ...result };
}

export interface DeclarePaymentInput {
  orderId: string;
  userId: string;
  payerNumber: string;
  declaredAmountXof: number;
  declaredReference: string;
  payeeNumber?: string;
}

/**
 * L'utilisateur déclare avoir payé.
 *
 * Cela ne débloque rien : la commande passe en « déclarée » et attend une
 * vérification humaine. C'est la garantie contre les fausses confirmations.
 */
export async function declarePayment(
  input: DeclarePaymentInput,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  const order = rows[0];

  if (!order) return { ok: false, error: "Commande introuvable." };
  // On vérifie la propriété : une commande ne se déclare que par son auteur.
  if (order.userId !== input.userId) return { ok: false, error: "Commande introuvable." };
  if (order.status === "confirmed") return { ok: false, error: "Cette commande est déjà réglée." };
  if (order.status === "declared" || order.status === "under_review") {
    return { ok: false, error: "Ta déclaration est déjà enregistrée, on la vérifie." };
  }
  if (order.status === "canceled" || order.status === "expired") {
    return { ok: false, error: "Cette commande n'est plus valable." };
  }

  await db
    .update(orders)
    .set({
      status: "declared",
      payerNumber: input.payerNumber,
      declaredAmountXof: input.declaredAmountXof,
      declaredReference: input.declaredReference,
      payeeNumber: input.payeeNumber ?? null,
      declaredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await recordEvent(
    order.id,
    "declared",
    `Déclaré : ${input.declaredAmountXof} FCFA depuis ${input.payerNumber} (réf. ${input.declaredReference}).`,
    input.userId,
  );

  await db.insert(notifications).values({
    userId: order.userId,
    type: "payment",
    title: "Paiement en cours de vérification",
    body: `Nous avons reçu ta déclaration pour la commande ${order.reference}. Tu seras prévenu dès sa validation.`,
    link: "/achats",
  });

  return { ok: true };
}

/**
 * Confirme une commande et ouvre l'accès.
 *
 * Point unique d'ouverture des droits : appelé par l'administration
 * aujourd'hui, par le webhook de l'opérateur demain. Idempotent — une
 * commande déjà confirmée ne produit aucun effet supplémentaire.
 */
export async function confirmOrder(
  orderId: string,
  actorId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];

  if (!order) return { ok: false, error: "Commande introuvable." };
  if (order.status === "confirmed") return { ok: false, error: "Commande déjà confirmée." };

  // Trace comptable du mouvement.
  const [payment] = await db
    .insert(payments)
    .values({
      userId: order.userId,
      provider: "momo_manual",
      status: "completed",
      amountXof: order.amountXof,
      kind: order.kind,
      targetId: order.pathwayId ?? null,
      transactionId: order.declaredReference ?? `${order.reference}-${Date.now()}`,
      paidAt: new Date(),
      metadata: {
        orderReference: order.reference,
        payerNumber: order.payerNumber,
        confirmedBy: actorId,
      },
    })
    .returning({ id: payments.id });

  if (order.kind === "premium") {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    await db
      .insert(subscriptions)
      .values({
        userId: order.userId,
        plan: "premium",
        status: "active",
        currentPeriodEnd: end,
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { plan: "premium", status: "active", currentPeriodEnd: end, updatedAt: new Date() },
      });
  } else if (order.pathwayId) {
    await db
      .insert(purchases)
      .values({
        userId: order.userId,
        kind: "pathway",
        pathwayId: order.pathwayId,
        paymentId: payment.id,
        amountXof: order.amountXof,
      })
      .onConflictDoNothing();
  }

  if (order.promotionId) await redeemPromotion(order.promotionId);

  await db
    .update(orders)
    .set({
      status: "confirmed",
      paymentId: payment.id,
      reviewedBy: actorId,
      reviewedAt: new Date(),
      reviewNote: note ?? null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await recordEvent(order.id, "confirmed", note ?? "Paiement confirmé.", actorId);

  await db.insert(notifications).values({
    userId: order.userId,
    type: "payment",
    title: order.kind === "premium" ? "Premium activé" : "Parcours débloqué",
    body:
      order.kind === "premium"
        ? "Ton abonnement Premium est actif. Tout le catalogue t'est ouvert."
        : "Ton paiement est confirmé : les missions de ton parcours sont ouvertes.",
    link: order.kind === "premium" ? "/premium" : "/parcours",
  });

  return { ok: true };
}

/** Refuse une commande. Le motif est envoyé à l'utilisateur, sans détour. */
export async function rejectOrder(
  orderId: string,
  actorId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];

  if (!order) return { ok: false, error: "Commande introuvable." };
  if (order.status === "confirmed") {
    return { ok: false, error: "Impossible de refuser une commande déjà confirmée." };
  }

  await db
    .update(orders)
    .set({
      status: "rejected",
      reviewedBy: actorId,
      reviewedAt: new Date(),
      reviewNote: reason,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await recordEvent(order.id, "rejected", reason, actorId);

  await db.insert(notifications).values({
    userId: order.userId,
    type: "payment",
    title: "Paiement non validé",
    body: `Commande ${order.reference} : ${reason}`,
    link: "/achats",
  });

  return { ok: true };
}

/** Place une commande en vérification (montant douteux, référence illisible…). */
export async function reviewOrder(
  orderId: string,
  actorId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return { ok: false, error: "Commande introuvable." };

  await db
    .update(orders)
    .set({ status: "under_review", reviewNote: note, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await recordEvent(orderId, "under_review", note, actorId);

  await db.insert(notifications).values({
    userId: order.userId,
    type: "payment",
    title: "Vérification en cours",
    body: `Commande ${order.reference} : ${note}`,
    link: "/achats",
  });

  return { ok: true };
}

/** Annulation par l'utilisateur lui-même. */
export async function cancelOrder(
  orderId: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];

  if (!order || order.userId !== userId) return { ok: false, error: "Commande introuvable." };
  if (order.status === "confirmed") return { ok: false, error: "Cette commande est déjà réglée." };

  await db
    .update(orders)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  await recordEvent(orderId, "canceled", "Annulée par l'utilisateur.", userId);

  return { ok: true };
}
