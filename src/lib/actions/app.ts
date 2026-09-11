"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  profiles,
  pathways,
  missions,
  favorites,
  notifications,
  discussions,
  discussionReplies,
  reactions,
  reports,
  challenges,
  challengeAttempts,
  supportTickets,
  supportMessages,
  results,
  payments,
  siteSettings,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { resolveAccess } from "@/lib/access";
import {
  startMission,
  saveDraft,
  completeMission,
  startPathway,
} from "@/lib/services/progression";
import {
  onboardingSchema,
  profileSchema,
  discussionSchema,
  replySchema,
  supportSchema,
} from "@/lib/validations";
import type { ActionState } from "./auth";

/* ---------------------------- Onboarding ---------------------------- */

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    domain: formData.get("domain") ?? "",
    level: formData.get("level") ?? "debutant",
    goalIds: formData.getAll("goalIds").map(String),
    interests: formData.getAll("interests").map(String),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const data = parsed.data;

  await db
    .insert(profiles)
    .values({
      userId: session.id,
      displayName: data.displayName,
      domain: data.domain,
      level: data.level,
      goalIds: data.goalIds,
      interests: data.interests,
      currentGoalId: data.goalIds[0],
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        displayName: data.displayName,
        domain: data.domain,
        level: data.level,
        goalIds: data.goalIds,
        interests: data.interests,
        currentGoalId: data.goalIds[0],
      },
    });

  await db
    .update(users)
    .set({ onboardedAt: new Date(), name: data.displayName })
    .where(eq(users.id, session.id));

  const suite = String(formData.get("suite") ?? "");
  const safe = suite.startsWith("/") && !suite.startsWith("//") ? suite : null;
  redirect(safe ?? "/tableau-de-bord?bienvenue=1");
}

export async function skipOnboardingAction(suite?: string): Promise<void> {
  const session = await requireUser();
  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, session.id));
  const safe = suite && suite.startsWith("/") && !suite.startsWith("//") ? suite : null;
  redirect(safe ?? "/tableau-de-bord");
}

export async function setCurrentGoalAction(goalId: string): Promise<void> {
  const session = await requireUser();
  await db
    .insert(profiles)
    .values({ userId: session.id, currentGoalId: goalId })
    .onConflictDoUpdate({ target: profiles.userId, set: { currentGoalId: goalId } });
  revalidatePath("/tableau-de-bord");
}

/* ------------------------------ Profil ------------------------------ */

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser();
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") ?? "",
    domain: formData.get("domain") ?? "",
    country: formData.get("country") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  await db
    .insert(profiles)
    .values({ userId: session.id, ...parsed.data })
    .onConflictDoUpdate({ target: profiles.userId, set: parsed.data });
  await db.update(users).set({ name: parsed.data.displayName }).where(eq(users.id, session.id));

  revalidatePath("/profil");
  return { success: "Profil mis à jour." };
}

/* ---------------------------- Parcours ------------------------------ */

export async function startPathwayAction(pathwaySlug: string): Promise<void> {
  const session = await requireUser(`/parcours/${pathwaySlug}`);
  const rows = await db.select().from(pathways).where(eq(pathways.slug, pathwaySlug)).limit(1);
  const pathway = rows[0];
  if (!pathway) redirect("/parcours");

  const access = await resolveAccess(session, {
    id: pathway.id,
    accessType: pathway.accessType,
    priceXof: pathway.priceXof,
  });
  if (!access.allowed) redirect(`/parcours/${pathwaySlug}?acces=${access.reason}`);

  await startPathway(session.id, pathway.id);

  const first = await db
    .select({ slug: missions.slug })
    .from(missions)
    .where(and(eq(missions.pathwayId, pathway.id), eq(missions.isPublished, true)))
    .orderBy(missions.position)
    .limit(1);

  redirect(first[0] ? `/missions/${first[0].slug}` : `/parcours/${pathwaySlug}`);
}

/* ----------------------------- Missions ----------------------------- */

async function loadMissionForUser(missionSlug: string) {
  const session = await requireUser(`/missions/${missionSlug}`);
  const rows = await db
    .select({ mission: missions, pathway: pathways })
    .from(missions)
    .innerJoin(pathways, eq(missions.pathwayId, pathways.id))
    .where(eq(missions.slug, missionSlug))
    .limit(1);
  if (!rows[0]) redirect("/parcours");

  const access = await resolveAccess(session, {
    id: rows[0].pathway.id,
    accessType: rows[0].pathway.accessType,
    priceXof: rows[0].pathway.priceXof,
  });
  if (!access.allowed) redirect(`/parcours/${rows[0].pathway.slug}?acces=${access.reason}`);

  return { session, ...rows[0] };
}

export async function startMissionAction(missionSlug: string): Promise<void> {
  const { session, mission } = await loadMissionForUser(missionSlug);
  await startMission(session.id, mission.id, mission.pathwayId);
  revalidatePath(`/missions/${missionSlug}`);
}

export async function saveDraftAction(
  missionSlug: string,
  answers: Record<string, unknown>,
  checkedItems: number[],
): Promise<{ ok: boolean }> {
  const { session, mission } = await loadMissionForUser(missionSlug);
  await startMission(session.id, mission.id, mission.pathwayId);
  await saveDraft(session.id, mission.id, answers, checkedItems);
  return { ok: true };
}

export async function completeMissionAction(
  missionSlug: string,
  answers: Record<string, unknown>,
  checkedItems: number[],
): Promise<{ ok: boolean; errors?: Record<string, string>; nextSlug?: string; percent?: number }> {
  const { session, mission, pathway } = await loadMissionForUser(missionSlug);

  const outcome = await completeMission(session.id, mission, answers, checkedItems);
  if (!outcome.ok) return { ok: false, errors: outcome.errors };

  const siblings = await db
    .select({ slug: missions.slug, position: missions.position })
    .from(missions)
    .where(and(eq(missions.pathwayId, pathway.id), eq(missions.isPublished, true)))
    .orderBy(missions.position);

  const index = siblings.findIndex((m) => m.slug === missionSlug);
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  revalidatePath("/tableau-de-bord");
  revalidatePath("/resultats");
  revalidatePath(`/parcours/${pathway.slug}`);

  return { ok: true, nextSlug: next?.slug, percent: outcome.progress?.percent ?? 0 };
}

/* ----------------------------- Favoris ------------------------------ */

export async function toggleFavoriteAction(
  entityType: string,
  entityId: string,
): Promise<{ favorited: boolean }> {
  const session = await requireUser();
  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, session.id),
        eq(favorites.entityType, entityType),
        eq(favorites.entityId, entityId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    revalidatePath("/favoris");
    return { favorited: false };
  }

  await db.insert(favorites).values({ userId: session.id, entityType, entityId });
  revalidatePath("/favoris");
  return { favorited: true };
}

/* --------------------------- Notifications -------------------------- */

export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, session.id)));
  revalidatePath("/notifications");
}

export async function markAllReadAction(): Promise<void> {
  const session = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, session.id), sql`${notifications.readAt} is null`));
  revalidatePath("/notifications");
}

/* ---------------------------- Discussion ---------------------------- */

export async function createDiscussionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser("/discussion");
  const parsed = discussionSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const [row] = await db
    .insert(discussions)
    .values({
      authorId: session.id,
      title: parsed.data.title,
      body: parsed.data.body,
      categoryId: parsed.data.categoryId || null,
    })
    .returning({ id: discussions.id });

  redirect(`/discussion/${row.id}`);
}

export async function replyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser("/discussion");
  const parsed = replySchema.safeParse({
    discussionId: formData.get("discussionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Message invalide." };

  const target = await db
    .select({ id: discussions.id, isLocked: discussions.isLocked, authorId: discussions.authorId })
    .from(discussions)
    .where(eq(discussions.id, parsed.data.discussionId))
    .limit(1);
  if (!target[0]) return { error: "Discussion introuvable." };
  if (target[0].isLocked) return { error: "Cette discussion est fermée." };

  await db.insert(discussionReplies).values({
    discussionId: parsed.data.discussionId,
    authorId: session.id,
    body: parsed.data.body,
  });

  await db
    .update(discussions)
    .set({ replyCount: sql`${discussions.replyCount} + 1`, lastActivityAt: new Date() })
    .where(eq(discussions.id, parsed.data.discussionId));

  if (target[0].authorId && target[0].authorId !== session.id) {
    await db.insert(notifications).values({
      userId: target[0].authorId,
      type: "discussion",
      title: "Nouvelle réponse",
      body: `${session.displayName ?? "Un membre"} a répondu à ta discussion.`,
      link: `/discussion/${parsed.data.discussionId}`,
    });
  }

  revalidatePath(`/discussion/${parsed.data.discussionId}`);
  return { success: "Réponse publiée." };
}

export async function toggleReactionAction(
  entityType: string,
  entityId: string,
  emoji = "👍",
): Promise<{ reacted: boolean }> {
  const session = await requireUser();
  const existing = await db
    .select({ id: reactions.id })
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, session.id),
        eq(reactions.entityType, entityType),
        eq(reactions.entityId, entityId),
        eq(reactions.emoji, emoji),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    revalidatePath(`/discussion/${entityId}`);
    return { reacted: false };
  }
  await db.insert(reactions).values({ userId: session.id, entityType, entityId, emoji });
  revalidatePath(`/discussion/${entityId}`);
  return { reacted: true };
}

export async function reportAction(
  entityType: string,
  entityId: string,
  reason: string,
): Promise<{ ok: boolean }> {
  const session = await requireUser();
  await db.insert(reports).values({
    reporterId: session.id,
    entityType,
    entityId,
    reason: reason.slice(0, 200),
  });
  return { ok: true };
}

/* ------------------------------ Arène ------------------------------- */

export async function submitChallengeAction(
  challengeId: string,
  answers: number[],
  durationSeconds: number,
): Promise<{ score: number; correct: number; total: number }> {
  const session = await requireUser("/arene");
  const rows = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  const challenge = rows[0];
  if (!challenge) return { score: 0, correct: 0, total: 0 };

  // La correction est faite côté serveur : le client ne reçoit jamais les
  // bonnes réponses avant d'avoir soumis.
  const questions = challenge.questions;
  const correct = questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0),
    0,
  );
  const base = correct * 10;
  const speedBonus =
    correct === questions.length && durationSeconds < challenge.durationSeconds
      ? Math.round((1 - durationSeconds / challenge.durationSeconds) * 20)
      : 0;
  const score = base + speedBonus;

  await db.insert(challengeAttempts).values({
    userId: session.id,
    challengeId,
    answers,
    score,
    correctCount: correct,
    totalCount: questions.length,
    durationSeconds,
    completedAt: new Date(),
  });

  revalidatePath("/arene");
  return { score, correct, total: questions.length };
}

/* ----------------------------- Support ------------------------------ */

export async function createTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  const parsed = supportSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
    email: formData.get("email") || session?.email,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      userId: session?.id ?? null,
      subject: parsed.data.subject,
      email: parsed.data.email ?? null,
    })
    .returning({ id: supportTickets.id });

  await db.insert(supportMessages).values({
    ticketId: ticket.id,
    senderRole: "user",
    authorId: session?.id ?? null,
    authorName: session?.displayName ?? "Visiteur",
    body: parsed.data.message,
  });

  revalidatePath("/support");
  return { success: "Ta demande a bien été envoyée. Nous te répondons rapidement." };
}

export async function replyTicketAction(
  ticketId: string,
  body: string,
): Promise<{ ok: boolean }> {
  const session = await requireUser("/support");
  const rows = await db
    .select({ userId: supportTickets.userId })
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);
  if (!rows[0]) return { ok: false };

  const isStaff = session.role !== "user";
  if (!isStaff && rows[0].userId !== session.id) return { ok: false };

  await db.insert(supportMessages).values({
    ticketId,
    senderRole: isStaff ? "staff" : "user",
    authorId: session.id,
    authorName: session.displayName ?? "Utilisateur",
    body: body.slice(0, 4000),
  });

  await db
    .update(supportTickets)
    .set({ status: isStaff ? "pending" : "open", updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId));

  if (isStaff && rows[0].userId) {
    await db.insert(notifications).values({
      userId: rows[0].userId,
      type: "support",
      title: "Réponse du support",
      body: "L'équipe Xwé IA a répondu à ta demande.",
      link: "/support",
    });
  }

  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { ok: true };
}

/* ---------------------------- Résultats ----------------------------- */

export async function deleteResultAction(id: string): Promise<void> {
  const session = await requireUser();
  await db.delete(results).where(and(eq(results.id, id), eq(results.userId, session.id)));
  revalidatePath("/resultats");
}

export async function togglePinResultAction(id: string): Promise<void> {
  const session = await requireUser();
  const rows = await db
    .select({ isPinned: results.isPinned })
    .from(results)
    .where(and(eq(results.id, id), eq(results.userId, session.id)))
    .limit(1);
  if (!rows[0]) return;
  await db.update(results).set({ isPinned: !rows[0].isPinned }).where(eq(results.id, id));
  revalidatePath("/resultats");
}

/* ------------------------- Achats (socle) --------------------------- */

/**
 * Enregistre une intention d'achat. Le rapprochement avec le prestataire de
 * paiement (KKiaPay) et l'activation réelle sont câblés dans le Prompt 2 —
 * ici on pose la trace en base, statut « pending ».
 */
export async function createPaymentIntentAction(
  kind: "pathway" | "premium",
  targetId?: string,
): Promise<{ paymentId: string; amountXof: number }> {
  const session = await requireUser("/premium");
  const settings = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1);

  let amount = settings[0]?.premiumPriceXof ?? 5500;
  if (kind === "pathway" && targetId) {
    const rows = await db
      .select({ priceXof: pathways.priceXof })
      .from(pathways)
      .where(eq(pathways.id, targetId))
      .limit(1);
    amount = rows[0]?.priceXof ?? 0;
  }

  const [payment] = await db
    .insert(payments)
    .values({
      userId: session.id,
      provider: "kkiapay",
      status: "pending",
      amountXof: amount,
      kind,
      targetId: targetId ?? null,
    })
    .returning({ id: payments.id });

  return { paymentId: payment.id, amountXof: amount };
}
