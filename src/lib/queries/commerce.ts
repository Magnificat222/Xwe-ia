import "server-only";

import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { payments, purchases, subscriptions, pathways } from "@/db/schema";

export async function getUserPurchases(userId: string) {
  const rows = await db
    .select({ purchase: purchases, pathway: pathways })
    .from(purchases)
    .leftJoin(pathways, eq(purchases.pathwayId, pathways.id))
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt));
  return rows.map((r) => ({ ...r.purchase, pathway: r.pathway }));
}

export async function getUserPayments(userId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

export async function getActiveSubscription(userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        or(isNull(subscriptions.currentPeriodEnd), gt(subscriptions.currentPeriodEnd, new Date())),
      ),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return rows[0] ?? null;
}
