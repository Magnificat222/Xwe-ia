import "server-only";

import { and, avg, count, desc, eq, gte, notInArray, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import {
  aiQuotas,
  aiUsage,
  notifications,
  orderEvents,
  orders,
  pathways,
  paymentNumbers,
  premiumBenefits,
  priceHistory,
  promotions,
  purchases,
  subscriptions,
  users,
} from "@/db/schema";
import type { OrderStatus } from "@/db/schema";

/** Commandes pour l'administration, avec l'acheteur et le parcours. */
export async function getAdminOrders(filters?: { status?: OrderStatus; q?: string }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(orders.status, filters.status));
  if (filters?.q) {
    conditions.push(
      sql`(${orders.reference} ilike ${`%${filters.q}%`} or ${users.email} ilike ${`%${filters.q}%`} or ${orders.declaredReference} ilike ${`%${filters.q}%`})`,
    );
  }

  return db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      kind: orders.kind,
      amountXof: orders.amountXof,
      listPriceXof: orders.listPriceXof,
      payerNumber: orders.payerNumber,
      declaredAmountXof: orders.declaredAmountXof,
      declaredReference: orders.declaredReference,
      declaredAt: orders.declaredAt,
      reviewNote: orders.reviewNote,
      createdAt: orders.createdAt,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      pathwayTitle: pathways.title,
      pathwaySlug: pathways.slug,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .leftJoin(pathways, eq(pathways.id, orders.pathwayId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

/** Journal d'une commande : chaque changement d'état, dans l'ordre. */
export async function getOrderTimeline(orderId: string) {
  return db
    .select({
      id: orderEvents.id,
      status: orderEvents.status,
      note: orderEvents.note,
      createdAt: orderEvents.createdAt,
      actorName: users.name,
    })
    .from(orderEvents)
    .leftJoin(users, eq(users.id, orderEvents.actorId))
    .where(eq(orderEvents.orderId, orderId))
    .orderBy(orderEvents.createdAt);
}

/** Compteurs par statut, pour les pastilles de filtre. */
export async function getOrderCounts() {
  const rows = await db
    .select({ status: orders.status, n: count() })
    .from(orders)
    .groupBy(orders.status);

  const map = new Map(rows.map((r) => [r.status, r.n]));
  return {
    declared: map.get("declared") ?? 0,
    underReview: map.get("under_review") ?? 0,
    awaiting: map.get("awaiting_payment") ?? 0,
    confirmed: map.get("confirmed") ?? 0,
    rejected: map.get("rejected") ?? 0,
    total: rows.reduce((acc, r) => acc + r.n, 0),
  };
}

/**
 * Tableau de bord commercial.
 *
 * Le chiffre d'affaires ne compte que les commandes confirmées : une
 * déclaration non vérifiée n'est pas une vente.
 */
export async function getCommerceOverview() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [revenue] = await db
    .select({ total: sum(orders.amountXof), n: count() })
    .from(orders)
    .where(eq(orders.status, "confirmed"));

  const [revenueMonth] = await db
    .select({ total: sum(orders.amountXof), n: count() })
    .from(orders)
    .where(and(eq(orders.status, "confirmed"), gte(orders.createdAt, thirtyDaysAgo)));

  const [basket] = await db
    .select({ value: avg(orders.amountXof) })
    .from(orders)
    .where(eq(orders.status, "confirmed"));

  const [premiumRevenue] = await db
    .select({ total: sum(orders.amountXof), n: count() })
    .from(orders)
    .where(and(eq(orders.status, "confirmed"), eq(orders.kind, "premium")));

  const [pathwayRevenue] = await db
    .select({ total: sum(orders.amountXof), n: count() })
    .from(orders)
    .where(and(eq(orders.status, "confirmed"), eq(orders.kind, "pathway")));

  const [totalUsers] = await db.select({ n: count() }).from(users);
  const [premiumUsers] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(and(eq(subscriptions.plan, "premium"), eq(subscriptions.status, "active")));

  const [buyers] = await db
    .select({ n: sql<number>`count(distinct ${purchases.userId})` })
    .from(purchases);

  const counts = await getOrderCounts();

  const users_ = totalUsers?.n ?? 0;
  const buyerCount = Number(buyers?.n ?? 0);

  return {
    revenueXof: Number(revenue?.total ?? 0),
    salesCount: revenue?.n ?? 0,
    revenueMonthXof: Number(revenueMonth?.total ?? 0),
    salesMonthCount: revenueMonth?.n ?? 0,
    averageBasketXof: Math.round(Number(basket?.value ?? 0)),
    premiumRevenueXof: Number(premiumRevenue?.total ?? 0),
    premiumSales: premiumRevenue?.n ?? 0,
    pathwayRevenueXof: Number(pathwayRevenue?.total ?? 0),
    pathwaySales: pathwayRevenue?.n ?? 0,
    totalUsers: users_,
    premiumUsers: premiumUsers?.n ?? 0,
    buyers: buyerCount,
    // Conversion : part des membres ayant acheté au moins une fois.
    conversionRate: users_ > 0 ? (buyerCount / users_) * 100 : 0,
    premiumRate: users_ > 0 ? ((premiumUsers?.n ?? 0) / users_) * 100 : 0,
    pendingPayments: counts.declared + counts.underReview,
    confirmedPayments: counts.confirmed,
    rejectedPayments: counts.rejected,
  };
}

/** Ventes par parcours : les plus vendus comme les invendus. */
export async function getSalesByPathway() {
  const sold = await db
    .select({
      pathwayId: orders.pathwayId,
      title: pathways.title,
      slug: pathways.slug,
      accessType: pathways.accessType,
      priceXof: pathways.priceXof,
      sales: count(),
      revenue: sum(orders.amountXof),
    })
    .from(orders)
    .innerJoin(pathways, eq(pathways.id, orders.pathwayId))
    .where(and(eq(orders.status, "confirmed"), eq(orders.kind, "pathway")))
    .groupBy(orders.pathwayId, pathways.title, pathways.slug, pathways.accessType, pathways.priceXof)
    .orderBy(desc(count()));

  // Les parcours payants sans aucune vente comptent autant que les autres :
  // c'est souvent là que se cache le problème de prix ou de promesse.
  const soldIds = sold.map((s) => s.pathwayId).filter(Boolean) as string[];
  const unsold = await db
    .select({
      pathwayId: pathways.id,
      title: pathways.title,
      slug: pathways.slug,
      accessType: pathways.accessType,
      priceXof: pathways.priceXof,
    })
    .from(pathways)
    .where(
      soldIds.length > 0
        ? and(eq(pathways.accessType, "paid"), notInArray(pathways.id, soldIds))
        : eq(pathways.accessType, "paid"),
    );

  return {
    sold: sold.map((s) => ({ ...s, revenue: Number(s.revenue ?? 0) })),
    unsold,
  };
}

/** Revenus jour par jour, pour la courbe du tableau commercial. */
export async function getRevenueTrend(days = 14) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sum(orders.amountXof),
      n: count(),
    })
    .from(orders)
    .where(and(eq(orders.status, "confirmed"), gte(orders.createdAt, since)))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  const map = new Map(rows.map((r) => [r.day, { total: Number(r.total ?? 0), n: r.n }]));
  const trend: { day: string; total: number; count: number }[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const entry = map.get(date);
    trend.push({ day: date, total: entry?.total ?? 0, count: entry?.n ?? 0 });
  }

  return trend;
}

export async function getAdminPromotions() {
  return db
    .select({
      id: promotions.id,
      label: promotions.label,
      code: promotions.code,
      discountType: promotions.discountType,
      discountValue: promotions.discountValue,
      startsAt: promotions.startsAt,
      endsAt: promotions.endsAt,
      maxRedemptions: promotions.maxRedemptions,
      redemptions: promotions.redemptions,
      isActive: promotions.isActive,
      appliesToPremium: promotions.appliesToPremium,
      pathwayId: promotions.pathwayId,
      pathwayTitle: pathways.title,
    })
    .from(promotions)
    .leftJoin(pathways, eq(pathways.id, promotions.pathwayId))
    .orderBy(desc(promotions.createdAt));
}

export async function getPaymentNumbers() {
  return db.select().from(paymentNumbers).orderBy(paymentNumbers.position);
}

export async function getPriceHistory(limit = 50) {
  return db
    .select({
      id: priceHistory.id,
      scope: priceHistory.scope,
      oldPriceXof: priceHistory.oldPriceXof,
      newPriceXof: priceHistory.newPriceXof,
      reason: priceHistory.reason,
      createdAt: priceHistory.createdAt,
      pathwayTitle: pathways.title,
      changedByName: users.name,
    })
    .from(priceHistory)
    .leftJoin(pathways, eq(pathways.id, priceHistory.pathwayId))
    .leftJoin(users, eq(users.id, priceHistory.changedBy))
    .orderBy(desc(priceHistory.createdAt))
    .limit(limit);
}

export async function getPremiumBenefits(onlyActive = false) {
  const query = db.select().from(premiumBenefits).orderBy(premiumBenefits.position);
  if (!onlyActive) return query;
  return db
    .select()
    .from(premiumBenefits)
    .where(eq(premiumBenefits.isActive, true))
    .orderBy(premiumBenefits.position);
}

/** Consommation IA agrégée, pour surveiller la dépense. */
export async function getAiUsageStats() {
  const since = new Date(Date.now() - 30 * 86400000);

  const [total] = await db
    .select({
      n: count(),
      inputTokens: sum(aiUsage.inputTokens),
      outputTokens: sum(aiUsage.outputTokens),
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, since));

  const byFeature = await db
    .select({ feature: aiUsage.feature, n: count() })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, since))
    .groupBy(aiUsage.feature)
    .orderBy(desc(count()));

  const [failures] = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(and(gte(aiUsage.createdAt, since), eq(aiUsage.ok, false)));

  const topUsers = await db
    .select({ userId: aiUsage.userId, email: users.email, n: count() })
    .from(aiUsage)
    .leftJoin(users, eq(users.id, aiUsage.userId))
    .where(gte(aiUsage.createdAt, since))
    .groupBy(aiUsage.userId, users.email)
    .orderBy(desc(count()))
    .limit(10);

  return {
    calls: total?.n ?? 0,
    inputTokens: Number(total?.inputTokens ?? 0),
    outputTokens: Number(total?.outputTokens ?? 0),
    failures: failures?.n ?? 0,
    byFeature,
    topUsers,
  };
}

/** Commandes d'un utilisateur, pour sa page « Achats ». */
export async function getUserOrders(userId: string) {
  return db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      kind: orders.kind,
      amountXof: orders.amountXof,
      listPriceXof: orders.listPriceXof,
      declaredAt: orders.declaredAt,
      reviewNote: orders.reviewNote,
      createdAt: orders.createdAt,
      expiresAt: orders.expiresAt,
      pathwayTitle: pathways.title,
      pathwaySlug: pathways.slug,
    })
    .from(orders)
    .leftJoin(pathways, eq(pathways.id, orders.pathwayId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/** Une commande précise appartenant à un utilisateur. */
export async function getUserOrder(userId: string, orderId: string) {
  const rows = await db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      kind: orders.kind,
      amountXof: orders.amountXof,
      listPriceXof: orders.listPriceXof,
      declaredAt: orders.declaredAt,
      reviewNote: orders.reviewNote,
      createdAt: orders.createdAt,
      expiresAt: orders.expiresAt,
      pathwayTitle: pathways.title,
      pathwaySlug: pathways.slug,
    })
    .from(orders)
    .leftJoin(pathways, eq(pathways.id, orders.pathwayId))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

/* --------------------------- Notifications --------------------------- */

/**
 * Repères pour l'écran d'annonces : audience atteignable et lecture réelle.
 * Le taux de lecture porte sur les 30 derniers jours, seule fenêtre où il
 * veut dire quelque chose.
 */
export async function getNotificationStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [activeUsers, premiumUsers, sent, read] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.isBanned, false)),
    db
      .select({ value: count() })
      .from(subscriptions)
      .where(and(eq(subscriptions.plan, "premium"), eq(subscriptions.status, "active"))),
    db
      .select({ value: count() })
      .from(notifications)
      .where(gte(notifications.createdAt, since)),
    db
      .select({ value: count() })
      .from(notifications)
      .where(and(gte(notifications.createdAt, since), sql`${notifications.readAt} is not null`)),
  ]);

  const sentMonth = sent[0]?.value ?? 0;
  const readMonth = read[0]?.value ?? 0;

  return {
    activeUsers: activeUsers[0]?.value ?? 0,
    premiumUsers: premiumUsers[0]?.value ?? 0,
    sentMonth,
    readRate: sentMonth === 0 ? 0 : (readMonth / sentMonth) * 100,
  };
}

/**
 * Historique des annonces générales.
 *
 * Une diffusion insère une ligne par destinataire : on les regroupe par
 * titre + corps + minute d'envoi pour reconstituer l'envoi d'origine.
 */
export async function getBroadcastHistory(limit = 20) {
  const rows = await db
    .select({
      title: notifications.title,
      body: notifications.body,
      link: notifications.link,
      minute: sql<string>`date_trunc('minute', ${notifications.createdAt})`,
      createdAt: sql<Date>`min(${notifications.createdAt})`,
      recipients: count(),
      readCount: sql<number>`count(*) filter (where ${notifications.readAt} is not null)`.mapWith(
        Number,
      ),
    })
    .from(notifications)
    .where(eq(notifications.type, "system"))
    .groupBy(
      notifications.title,
      notifications.body,
      notifications.link,
      sql`date_trunc('minute', ${notifications.createdAt})`,
    )
    .having(sql`count(*) > 1`)
    .orderBy(desc(sql`date_trunc('minute', ${notifications.createdAt})`))
    .limit(limit);

  return rows.map((row) => ({ ...row, createdAt: new Date(row.createdAt) }));
}

/* ------------------------------- Quotas IA --------------------------- */

/** Quotas d'IA par formule, triés pour un affichage stable. */
export async function getAiQuotas() {
  return db.select().from(aiQuotas).orderBy(aiQuotas.plan, aiQuotas.feature);
}

/** Provenance des réponses : montre si le repli hors ligne prend le dessus. */
export async function getAiProviderSplit() {
  const since = new Date(Date.now() - 30 * 86400000);
  return db
    .select({ provider: aiUsage.provider, n: count() })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, since))
    .groupBy(aiUsage.provider)
    .orderBy(desc(count()));
}

/** Consommation quotidienne d'IA, pour repérer les pics. */
export async function getAiDailyTrend(days = 14) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db
    .select({
      day: sql<string>`to_char(${aiUsage.createdAt}, 'YYYY-MM-DD')`,
      n: count(),
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, since))
    .groupBy(sql`to_char(${aiUsage.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${aiUsage.createdAt}, 'YYYY-MM-DD')`);

  // On complète les jours creux : un histogramme troué se lit mal.
  const byDay = new Map(rows.map((r) => [r.day, r.n]));
  const out: { day: string; n: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push({ day, n: byDay.get(day) ?? 0 });
  }
  return out;
}
