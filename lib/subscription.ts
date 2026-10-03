import type { Prisma } from "@prisma/client";

// Single definition of "is this user Premium right now?".
//
// Rules:
//  - plan must be PREMIUM and status ACTIVE or TRIALING;
//  - currentPeriodEnd in the past  => expired;
//  - currentPeriodEnd null         => treated as expired-safe legacy: the
//    migration gives every existing Premium row a 31-day end date, and every
//    code path that grants Premium now sets one (see grantPremiumPeriod).
//    A null end can therefore only appear on a row written by old code.
type SubscriptionLike = {
  plan: "FREE" | "PREMIUM";
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING";
  currentPeriodEnd: Date | null;
};

export function isPremiumActive(
  subscription: SubscriptionLike | null | undefined,
  now: Date = new Date()
): boolean {
  if (!subscription) return false;
  if (subscription.plan !== "PREMIUM") return false;
  if (subscription.status !== "ACTIVE" && subscription.status !== "TRIALING") return false;
  // No end date => treated as expired (see header). Every grant path sets one.
  if (!subscription.currentPeriodEnd || subscription.currentPeriodEnd <= now) return false;
  return true;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// Grants or extends one Premium period (default 31 days). Extends from the
// current end if still active, otherwise starts now.
export function nextPremiumEnd(
  current: SubscriptionLike | null | undefined,
  days: number,
  now: Date = new Date()
): Date {
  const base = current && isPremiumActive(current, now) && current.currentPeriodEnd ? current.currentPeriodEnd : now;
  return addDays(base, days);
}

export const PREMIUM_PERIOD_DAYS = 31;

// Grants or extends ONE Premium period inside an existing DB transaction.
// The subscription row is locked (SELECT ... FOR UPDATE) before it is read, so
// two payments for the same user processed at the same moment stack their
// durations instead of overwriting each other. Every automatic path
// (Kkiapay, MTN/Celtis approval) must go through this function.
export async function grantPremiumPeriod(
  tx: Prisma.TransactionClient,
  userId: string,
  days: number,
  now: Date = new Date()
): Promise<Date> {
  await tx.subscription.upsert({
    where: { userId },
    update: {},
    create: { userId, plan: "FREE", status: "ACTIVE" },
  });
  await tx.$queryRaw`SELECT "id" FROM "Subscription" WHERE "userId" = ${userId} FOR UPDATE`;

  const current = await tx.subscription.findUniqueOrThrow({ where: { userId } });
  const end = nextPremiumEnd(current, days, now);
  await tx.subscription.update({
    where: { userId },
    data: { plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd: end, startedAt: current.startedAt ?? now },
  });
  return end;
}
