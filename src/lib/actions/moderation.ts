"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  discussionReplies,
  discussions,
  moderationLogs,
  notifications,
  users,
} from "@/db/schema";
import type { ModerationAction } from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import type { ActionState } from "./auth";

/**
 * Modération de la communauté.
 *
 * Principe retenu : on masque plutôt qu'on supprime. Le contenu masqué reste
 * consultable par l'équipe — indispensable en cas de contestation — alors
 * qu'une suppression sèche efface aussi la preuve.
 *
 * Aucune IA n'intervient ici : la Discussion est un espace humain, modéré
 * par des humains.
 */

async function trace(
  moderatorId: string,
  action: ModerationAction,
  entityType: string,
  entityId: string,
  reason?: string,
) {
  await db.insert(moderationLogs).values({ moderatorId, action, entityType, entityId, reason });
  await db.insert(auditLogs).values({
    actorId: moderatorId,
    action: `moderation.${action}`,
    entity: entityType,
    entityId,
    metadata: reason ? { reason } : undefined,
  });
}

/* --------------------------- Publications --------------------------- */

export async function hideDiscussionAction(
  id: string,
  hidden: boolean,
  reason?: string,
): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  await db
    .update(discussions)
    .set({
      isHidden: hidden,
      hiddenReason: hidden ? (reason ?? "Contenu masqué par la modération.") : null,
      updatedAt: new Date(),
    })
    .where(eq(discussions.id, id));

  await trace(moderator.id, hidden ? "hide" : "unhide", "discussion", id, reason);

  revalidatePath("/admin/discussion");
  revalidatePath("/discussion");
  return { success: hidden ? "Publication masquée." : "Publication rétablie." };
}

export async function deleteDiscussionAction(id: string, reason?: string): Promise<ActionState> {
  const moderator = await requireRole("moderator");
  await trace(moderator.id, "delete", "discussion", id, reason);
  await db.delete(discussions).where(eq(discussions.id, id));

  revalidatePath("/admin/discussion");
  revalidatePath("/discussion");
  return { success: "Publication supprimée." };
}

export async function lockDiscussionAction(id: string, locked: boolean): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  await db
    .update(discussions)
    .set({ isLocked: locked, updatedAt: new Date() })
    .where(eq(discussions.id, id));

  await trace(moderator.id, locked ? "lock" : "unlock", "discussion", id);

  revalidatePath("/admin/discussion");
  revalidatePath(`/discussion/${id}`);
  return { success: locked ? "Discussion fermée." : "Discussion réouverte." };
}

export async function pinDiscussionAction(id: string, pinned: boolean): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  await db
    .update(discussions)
    .set({ isPinned: pinned, updatedAt: new Date() })
    .where(eq(discussions.id, id));

  await trace(moderator.id, pinned ? "pin" : "unpin", "discussion", id);

  revalidatePath("/admin/discussion");
  revalidatePath("/discussion");
  return { success: pinned ? "Discussion épinglée." : "Épingle retirée." };
}

/* ----------------------------- Réponses ------------------------------ */

export async function hideReplyAction(
  id: string,
  hidden: boolean,
  reason?: string,
): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  await db
    .update(discussionReplies)
    .set({
      isHidden: hidden,
      hiddenReason: hidden ? (reason ?? "Réponse masquée par la modération.") : null,
      updatedAt: new Date(),
    })
    .where(eq(discussionReplies.id, id));

  await trace(moderator.id, hidden ? "hide" : "unhide", "reply", id, reason);

  revalidatePath("/admin/discussion");
  return { success: hidden ? "Réponse masquée." : "Réponse rétablie." };
}

export async function deleteReplyAction(id: string, reason?: string): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  const rows = await db
    .select({ discussionId: discussionReplies.discussionId })
    .from(discussionReplies)
    .where(eq(discussionReplies.id, id))
    .limit(1);

  await trace(moderator.id, "delete", "reply", id, reason);
  await db.delete(discussionReplies).where(eq(discussionReplies.id, id));

  // Le compteur doit rester juste, sinon la liste ment.
  if (rows[0]) {
    await db
      .update(discussions)
      .set({ replyCount: sql`greatest(0, ${discussions.replyCount} - 1)` })
      .where(eq(discussions.id, rows[0].discussionId));
  }

  revalidatePath("/admin/discussion");
  return { success: "Réponse supprimée." };
}

/* ---------------------------- Utilisateurs --------------------------- */

/** Suspend un membre : il conserve son compte mais ne peut plus publier. */
export async function suspendUserAction(
  userId: string,
  suspended: boolean,
  reason?: string,
): Promise<ActionState> {
  const moderator = await requireRole("moderator");

  await db.update(users).set({ isBanned: suspended }).where(eq(users.id, userId));
  await trace(moderator.id, suspended ? "suspend_user" : "restore_user", "user", userId, reason);

  if (suspended) {
    await db.insert(notifications).values({
      userId,
      type: "system",
      title: "Compte suspendu",
      body: reason
        ? `Ton compte a été suspendu : ${reason}`
        : "Ton compte a été suspendu par la modération. Contacte le support si tu penses qu'il s'agit d'une erreur.",
      link: "/support",
    });
  }

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/discussion");
  return { success: suspended ? "Membre suspendu." : "Suspension levée." };
}
