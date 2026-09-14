import "server-only";

import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { pathways, promotions, siteSettings } from "@/db/schema";
import type { Promotion } from "@/db/schema";

/**
 * Moteur de prix.
 *
 * Règle absolue : aucun montant affiché ou facturé ne vient du navigateur.
 * Toute page qui montre un prix, et toute action qui en encaisse un, passe
 * par ici. Le frontend ne fait que rendre le résultat.
 */

export interface PriceQuote {
  /** Tarif catalogue, avant remise. */
  listPriceXof: number;
  /** Montant réellement dû. */
  amountXof: number;
  /** Remise appliquée, en francs. */
  discountXof: number;
  promotion: { id: string; label: string; code: string | null } | null;
  /** Vrai lorsqu'une promotion fait baisser le prix. */
  isDiscounted: boolean;
}

const DEFAULT_PREMIUM_PRICE = 5500;

/** Une promotion est active si elle est activée, dans sa fenêtre, et non épuisée. */
function promotionIsUsable(promotion: Promotion, now: Date): boolean {
  if (!promotion.isActive) return false;
  if (promotion.startsAt && promotion.startsAt > now) return false;
  if (promotion.endsAt && promotion.endsAt < now) return false;
  if (promotion.maxRedemptions !== null && promotion.redemptions >= promotion.maxRedemptions) {
    return false;
  }
  return true;
}

/** Applique une remise à un tarif. Le résultat ne peut jamais être négatif. */
export function applyDiscount(listPriceXof: number, promotion: Promotion): number {
  let price = listPriceXof;

  if (promotion.discountType === "percent") {
    price = Math.round(listPriceXof * (1 - promotion.discountValue / 100));
  } else if (promotion.discountType === "amount") {
    price = listPriceXof - promotion.discountValue;
  } else {
    // fixed_price : la valeur EST le nouveau prix.
    price = promotion.discountValue;
  }

  return Math.max(0, Math.min(price, listPriceXof));
}

/**
 * Sélectionne la meilleure promotion applicable — la moins chère pour
 * l'utilisateur. En cas d'égalité, la première trouvée l'emporte.
 */
function bestPromotion(listPriceXof: number, candidates: Promotion[], now: Date) {
  let winner: { promotion: Promotion; price: number } | null = null;

  for (const promotion of candidates) {
    if (!promotionIsUsable(promotion, now)) continue;
    const price = applyDiscount(listPriceXof, promotion);
    if (!winner || price < winner.price) winner = { promotion, price };
  }

  return winner;
}

function quoteFrom(listPriceXof: number, winner: { promotion: Promotion; price: number } | null): PriceQuote {
  if (!winner || winner.price >= listPriceXof) {
    return {
      listPriceXof,
      amountXof: listPriceXof,
      discountXof: 0,
      promotion: null,
      isDiscounted: false,
    };
  }

  return {
    listPriceXof,
    amountXof: winner.price,
    discountXof: listPriceXof - winner.price,
    promotion: {
      id: winner.promotion.id,
      label: winner.promotion.label,
      code: winner.promotion.code,
    },
    isDiscounted: true,
  };
}

/** Prix d'un parcours, promotions comprises. */
export async function quotePathway(pathwayId: string): Promise<PriceQuote | null> {
  const rows = await db
    .select({ priceXof: pathways.priceXof, accessType: pathways.accessType })
    .from(pathways)
    .where(eq(pathways.id, pathwayId))
    .limit(1);

  const pathway = rows[0];
  if (!pathway) return null;

  // Un parcours gratuit ou Premium ne se vend pas à l'unité.
  const listPriceXof = pathway.accessType === "paid" ? pathway.priceXof : 0;
  if (listPriceXof <= 0) {
    return { listPriceXof: 0, amountXof: 0, discountXof: 0, promotion: null, isDiscounted: false };
  }

  const now = new Date();
  const candidates = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.isActive, true),
        // Promotion ciblée sur ce parcours, ou promotion globale.
        or(eq(promotions.pathwayId, pathwayId), isNull(promotions.pathwayId)),
        eq(promotions.appliesToPremium, false),
      ),
    );

  return quoteFrom(listPriceXof, bestPromotion(listPriceXof, candidates, now));
}

/** Prix de l'abonnement Premium, promotions comprises. */
export async function quotePremium(): Promise<PriceQuote> {
  const settings = await db
    .select({ premiumPriceXof: siteSettings.premiumPriceXof })
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1);

  const listPriceXof = settings[0]?.premiumPriceXof ?? DEFAULT_PREMIUM_PRICE;

  const now = new Date();
  const candidates = await db
    .select()
    .from(promotions)
    .where(and(eq(promotions.isActive, true), eq(promotions.appliesToPremium, true)));

  return quoteFrom(listPriceXof, bestPromotion(listPriceXof, candidates, now));
}

/** Tarifs de plusieurs parcours en une fois — pour les listes et le catalogue. */
export async function quotePathways(pathwayIds: string[]): Promise<Map<string, PriceQuote>> {
  const result = new Map<string, PriceQuote>();
  if (pathwayIds.length === 0) return result;

  const rows = await db
    .select({ id: pathways.id, priceXof: pathways.priceXof, accessType: pathways.accessType })
    .from(pathways);

  const now = new Date();
  const allPromotions = await db
    .select()
    .from(promotions)
    .where(and(eq(promotions.isActive, true), eq(promotions.appliesToPremium, false)));

  for (const pathway of rows) {
    if (!pathwayIds.includes(pathway.id)) continue;

    const listPriceXof = pathway.accessType === "paid" ? pathway.priceXof : 0;
    if (listPriceXof <= 0) {
      result.set(pathway.id, {
        listPriceXof: 0,
        amountXof: 0,
        discountXof: 0,
        promotion: null,
        isDiscounted: false,
      });
      continue;
    }

    const candidates = allPromotions.filter(
      (promotion) => promotion.pathwayId === pathway.id || promotion.pathwayId === null,
    );
    result.set(pathway.id, quoteFrom(listPriceXof, bestPromotion(listPriceXof, candidates, now)));
  }

  return result;
}

/** Incrémente le compteur d'utilisation d'une promotion (à la confirmation). */
export async function redeemPromotion(promotionId: string): Promise<void> {
  await db
    .update(promotions)
    .set({ redemptions: sql`${promotions.redemptions} + 1` })
    .where(eq(promotions.id, promotionId));
}

/** Promotions en cours, pour l'affichage marketing. */
export async function getActivePromotions() {
  const now = new Date();
  return db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.isActive, true),
        or(isNull(promotions.startsAt), lte(promotions.startsAt, now)),
        or(isNull(promotions.endsAt), gt(promotions.endsAt, now)),
      ),
    );
}
