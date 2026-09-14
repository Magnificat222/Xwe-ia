import "server-only";

import { and, desc, eq, ilike, or, count } from "drizzle-orm";
import { db } from "@/db";
import {
  discussions,
  discussionReplies,
  reactions,
  categories,
  users,
  profiles,
  supportTickets,
  supportMessages,
} from "@/db/schema";

export async function getDiscussions(options?: { categorySlug?: string; q?: string }) {
  const filters = [];
  if (options?.categorySlug) filters.push(eq(categories.slug, options.categorySlug));
  if (options?.q) {
    filters.push(
      or(ilike(discussions.title, `%${options.q}%`), ilike(discussions.body, `%${options.q}%`))!,
    );
  }

  const rows = await db
    .select({
      discussion: discussions,
      category: categories,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorDisplayName: profiles.displayName,
    })
    .from(discussions)
    .leftJoin(categories, eq(discussions.categoryId, categories.id))
    .leftJoin(users, eq(discussions.authorId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(discussions.isPinned), desc(discussions.lastActivityAt))
    .limit(50);

  return rows.map((r) => ({
    ...r.discussion,
    category: r.category,
    author: {
      name: r.authorDisplayName ?? r.authorName ?? "Membre",
      avatarUrl: r.authorAvatar,
    },
  }));
}

export async function getDiscussion(id: string) {
  const rows = await db
    .select({
      discussion: discussions,
      category: categories,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorDisplayName: profiles.displayName,
    })
    .from(discussions)
    .leftJoin(categories, eq(discussions.categoryId, categories.id))
    .leftJoin(users, eq(discussions.authorId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(discussions.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const replyRows = await db
    .select({
      reply: discussionReplies,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorDisplayName: profiles.displayName,
    })
    .from(discussionReplies)
    .leftJoin(users, eq(discussionReplies.authorId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(discussionReplies.discussionId, id))
    .orderBy(discussionReplies.createdAt);

  const reactionRows = await db
    .select({ entityId: reactions.entityId, emoji: reactions.emoji, value: count() })
    .from(reactions)
    .where(eq(reactions.entityType, "reply"))
    .groupBy(reactions.entityId, reactions.emoji);

  const reactionMap = new Map<string, number>();
  for (const row of reactionRows) reactionMap.set(row.entityId, row.value);

  return {
    ...rows[0].discussion,
    category: rows[0].category,
    author: {
      name: rows[0].authorDisplayName ?? rows[0].authorName ?? "Membre",
      avatarUrl: rows[0].authorAvatar,
    },
    replies: replyRows.map((r) => ({
      ...r.reply,
      reactionCount: reactionMap.get(r.reply.id) ?? 0,
      author: {
        name: r.authorDisplayName ?? r.authorName ?? "Membre",
        avatarUrl: r.authorAvatar,
      },
    })),
  };
}

export async function getUserReactions(userId: string) {
  const rows = await db
    .select({ entityId: reactions.entityId })
    .from(reactions)
    .where(eq(reactions.userId, userId));
  return new Set(rows.map((r) => r.entityId));
}

export async function getCommunityStats() {
  const [topics, replies, members] = await Promise.all([
    db.select({ value: count() }).from(discussions),
    db.select({ value: count() }).from(discussionReplies),
    db.select({ value: count() }).from(users),
  ]);
  return {
    topics: topics[0]?.value ?? 0,
    replies: replies[0]?.value ?? 0,
    members: members[0]?.value ?? 0,
  };
}

/* ------------------------------ Support ----------------------------- */

export async function getUserTickets(userId: string) {
  return db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.updatedAt));
}

export async function getTicket(id: string, userId?: string) {
  const rows = await db
    .select()
    .from(supportTickets)
    .where(
      userId
        ? and(eq(supportTickets.id, id), eq(supportTickets.userId, userId))
        : eq(supportTickets.id, id),
    )
    .limit(1);
  if (!rows[0]) return null;

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.ticketId, id))
    .orderBy(supportMessages.createdAt);

  return { ...rows[0], messages };
}
