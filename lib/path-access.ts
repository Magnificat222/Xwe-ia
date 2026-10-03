// Who may open a LearningPath — computed on the server, never trusted from
// the client.
//
//  FREE     -> any logged-in user
//  PREMIUM  -> active, non-expired Premium (computed live => expiry is instant)
//  CREDITS  -> needs a PathAccess row (bought with credits or admin grant)
//
// Premium does NOT unlock CREDITS paths. An admin can gift access to any path
// with a PathAccess(source = ADMIN_GRANT) row. ADMIN role sees everything.
import { prisma } from "@/lib/prisma";
import { isPremiumActive } from "@/lib/subscription";
import { debitUser, TX_OPTIONS } from "@/lib/credits";
import { ServiceError, isUniqueViolation } from "@/lib/services/errors";

export type PathAccessReason = "FREE" | "PREMIUM" | "CREDITS" | "ADMIN_GRANT" | "ADMIN";
export type PathRequirement = "NONE" | "PREMIUM" | "CREDITS" | "UNPUBLISHED";

export type PathAccessState = {
  hasAccess: boolean;
  reason: PathAccessReason | null;
  requires: PathRequirement; // what is missing when hasAccess is false
  creditCost: number;
};

export async function getPathAccess(
  userId: string,
  path: { id: string; accessType: "FREE" | "PREMIUM" | "CREDITS"; creditCost: number; isPublished: boolean }
): Promise<PathAccessState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
      pathAccesses: { where: { learningPathId: path.id }, select: { source: true } },
    },
  });

  const base = { creditCost: path.creditCost };
  if (!user) return { ...base, hasAccess: false, reason: null, requires: "NONE" };

  if (user.role === "ADMIN") return { ...base, hasAccess: true, reason: "ADMIN", requires: "NONE" };
  if (!path.isPublished) return { ...base, hasAccess: false, reason: null, requires: "UNPUBLISHED" };

  const grant = user.pathAccesses[0];
  if (grant) return { ...base, hasAccess: true, reason: grant.source, requires: "NONE" };

  if (path.accessType === "FREE") return { ...base, hasAccess: true, reason: "FREE", requires: "NONE" };

  if (path.accessType === "PREMIUM") {
    return isPremiumActive(user.subscription)
      ? { ...base, hasAccess: true, reason: "PREMIUM", requires: "NONE" }
      : { ...base, hasAccess: false, reason: null, requires: "PREMIUM" };
  }

  return { ...base, hasAccess: false, reason: null, requires: "CREDITS" };
}

// Spend credits to unlock a CREDITS path. Safe against double clicks:
//  - the price is read from the DB inside the transaction (never from the request);
//  - debit + ledger line + PathAccess are one atomic transaction;
//  - @@unique([userId, learningPathId]) rolls back a concurrent duplicate,
//    including its debit, so nobody is charged twice.
export async function unlockPathWithCredits(userId: string, slug: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const path = await tx.learningPath.findUnique({
        where: { slug },
        select: { id: true, title: true, accessType: true, creditCost: true, isPublished: true },
      });
      if (!path || !path.isPublished) {
        throw new ServiceError("PATH_NOT_FOUND", "Parcours introuvable.", 404);
      }
      if (path.accessType !== "CREDITS") {
        throw new ServiceError("NOT_PURCHASABLE", "Ce parcours ne se débloque pas avec des crédits.", 400);
      }
      if (path.creditCost <= 0) {
        throw new ServiceError("INVALID_PRICE", "Le prix de ce parcours n'est pas configuré.", 409);
      }

      const existing = await tx.pathAccess.findUnique({
        where: { userId_learningPathId: { userId, learningPathId: path.id } },
        select: { id: true },
      });
      if (existing) return { unlocked: true, alreadyUnlocked: true, creditsSpent: 0 };

      const ledger = await debitUser(tx, {
        userId,
        amount: path.creditCost,
        type: "SPEND",
        description: `Déblocage du parcours : ${path.title}`,
        idempotencyKey: `unlock:${userId}:${path.id}`,
        learningPathId: path.id,
      });

      await tx.pathAccess.create({
        data: {
          userId,
          learningPathId: path.id,
          source: "CREDITS",
          creditsSpent: path.creditCost,
          creditTransactionId: ledger.id,
        },
      });

      return {
        unlocked: true,
        alreadyUnlocked: false,
        creditsSpent: path.creditCost,
        balance: ledger.balanceAfter,
      };
    }, TX_OPTIONS);
  } catch (error) {
    // A parallel request won the race: our transaction (and debit) rolled back.
    if (isUniqueViolation(error)) return { unlocked: true, alreadyUnlocked: true, creditsSpent: 0 };
    throw error;
  }
}

// Admin gift: no credits involved.
export async function grantPathAccess(adminId: string, userId: string, learningPathId: string) {
  return prisma.pathAccess.upsert({
    where: { userId_learningPathId: { userId, learningPathId } },
    update: {},
    create: { userId, learningPathId, source: "ADMIN_GRANT", grantedById: adminId },
  });
}

// Can this user open this mission's content?
//  - a mission in no published path keeps the legacy rule (mission.isPremium);
//  - a mission inside paths is open if ANY containing path grants access
//    (so a mission shared with a free path stays free);
//  - the legacy mission.isPremium flag still applies on top (Premium required).
export async function canAccessMission(userId: string | null, missionId: string, missionIsPremium: boolean) {
  const [paths, user] = await Promise.all([
    prisma.learningPathMission.findMany({
      where: { missionId, learningPath: { isPublished: true } },
      select: { learningPath: { select: { id: true, accessType: true, creditCost: true, isPublished: true } } },
    }),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, subscription: { select: { plan: true, status: true, currentPeriodEnd: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (user?.role === "ADMIN") return { allowed: true, lockedBy: null as PathRequirement | null };

  if (missionIsPremium && !isPremiumActive(user?.subscription)) {
    return { allowed: false, lockedBy: "PREMIUM" as PathRequirement };
  }
  if (paths.length === 0) return { allowed: true, lockedBy: null };
  if (!userId) {
    const anyFree = paths.some((p) => p.learningPath.accessType === "FREE");
    return { allowed: anyFree, lockedBy: anyFree ? null : ("CREDITS" as PathRequirement) };
  }

  let firstBlock: PathRequirement = "NONE";
  for (const { learningPath } of paths) {
    const state = await getPathAccess(userId, learningPath);
    if (state.hasAccess) return { allowed: true, lockedBy: null };
    if (firstBlock === "NONE") firstBlock = state.requires;
  }
  return { allowed: false, lockedBy: firstBlock };
}

// The path a guided-project wizard belongs to (e.g. "business-plan"), if the
// admin has created one. No path => the wizard stays open as before (no
// behaviour change for existing installs). The lookup is by wizardType on the
// SERVER, so a client cannot bypass the gate by omitting or faking a slug.
export async function findPathForWizard(wizardType: string) {
  return prisma.learningPath.findFirst({
    where: { wizardType, isPublished: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, slug: true, title: true, accessType: true, creditCost: true, isPublished: true },
  });
}

// May this user create / use a guided project of this type?
export async function canUseWizard(userId: string, wizardType: string) {
  const path = await findPathForWizard(wizardType);
  if (!path) return { allowed: true, path: null };
  const state = await getPathAccess(userId, path);
  return { allowed: state.hasAccess, path };
}
