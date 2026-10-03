"use server";

import { nextPremiumEnd, PREMIUM_PERIOD_DAYS } from "@/lib/subscription";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/guards";

// requireAdminId re-reads the role in the database on every call: the role in
// the JWT is frozen at login, so a demoted admin would otherwise keep these
// powers (delete users, change roles, grant Premium) until the token expires.

export async function deleteUser(userId: string) {
  const adminId = await requireAdminId();
  if (adminId === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte administrateur.");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}

export async function setUserRole(userId: string, role: "USER" | "MODERATOR" | "ADMIN") {
  const adminId = await requireAdminId();
  if (adminId === userId) {
    throw new Error("Vous ne pouvez pas changer votre propre rôle.");
  }
  if (role !== "USER" && role !== "MODERATOR" && role !== "ADMIN") {
    throw new Error("Rôle invalide.");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin/users");
}

export async function setUserPlan(userId: string, plan: "FREE" | "PREMIUM") {
  await requireAdminId();
  if (plan !== "FREE" && plan !== "PREMIUM") {
    throw new Error("Plan invalide.");
  }

  // PREMIUM = one 31-day period from now (admin grants renew like a payment);
  // FREE clears the end date.
  const now = new Date();
  const end = plan === "PREMIUM" ? nextPremiumEnd(null, PREMIUM_PERIOD_DAYS, now) : null;
  await prisma.subscription.upsert({
    where: { userId },
    update: { plan, status: "ACTIVE", currentPeriodEnd: end, ...(plan === "PREMIUM" ? { startedAt: now } : {}) },
    create: { userId, plan, status: "ACTIVE", currentPeriodEnd: end, startedAt: plan === "PREMIUM" ? now : null },
  });

  revalidatePath("/admin/users");
}
