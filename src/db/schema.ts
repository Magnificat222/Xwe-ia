/**
 * Xwé IA — schéma de base de données (PostgreSQL / Drizzle).
 *
 * Organisation :
 *   1. Énumérations
 *   2. Identité & accès      users, profiles, sessions, verification_tokens, audit_logs
 *   3. Contenu               categories, goals, pathways, goal_pathways, missions,
 *                            resources, tools, prompts
 *   4. Activité              mission_responses, mission_progress, pathway_progress,
 *                            results, documents, favorites, notifications
 *   5. Communauté            discussions, discussion_replies, reactions, reports
 *   6. Arène                 games, challenges, challenge_attempts, duels
 *   7. Monétisation          payments, purchases, subscriptions
 *   8. Plateforme            legal_pages, faq_items, site_settings, support_*
 */
import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const id = () =>
  varchar("id", { length: 32 })
    .primaryKey()
    .$defaultFn(() => createId());

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ------------------------------------------------------------------ *
 * 1. Énumérations
 * ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", ["user", "moderator", "admin", "super_admin"]);
export const levelEnum = pgEnum("level", ["debutant", "intermediaire", "avance"]);
export const accessTypeEnum = pgEnum("access_type", ["free", "paid", "premium"]);
export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "number",
  "date",
  "file",
]);
export const progressStatusEnum = pgEnum("progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);
export const resourceTypeEnum = pgEnum("resource_type", [
  "article",
  "video",
  "pdf",
  "template",
  "link",
  "checklist",
]);
export const resultTypeEnum = pgEnum("result_type", [
  "mission",
  "pathway",
  "project",
  "document",
]);
export const documentFormatEnum = pgEnum("document_format", ["markdown", "docx", "pdf", "txt"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "system",
  "mission",
  "pathway",
  "discussion",
  "arena",
  "payment",
  "premium",
  "resource",
  "support",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
// Le fournisseur est une donnée, pas une branche de code : ajouter un
// prestataire (momo_api, carte, agrégateur) ne change que cette liste et
// l'implémentation correspondante dans lib/payments/providers.
export const paymentProviderEnum = pgEnum("payment_provider", [
  "momo_manual",
  "momo_api",
  "kkiapay",
  "manual",
  "offline",
]);

/**
 * Cycle de vie d'une commande, distinct de celui du paiement : une commande
 * peut être abandonnée ou expirer sans qu'aucun paiement n'ait eu lieu.
 */
export const orderStatusEnum = pgEnum("order_status", [
  "draft",            // créée, l'utilisateur n'a pas encore déclaré son paiement
  "awaiting_payment", // instructions affichées
  "declared",         // l'utilisateur a déclaré avoir payé — à vérifier
  "under_review",     // l'administration demande une vérification
  "confirmed",        // paiement validé, accès ouvert
  "rejected",         // paiement refusé
  "canceled",         // annulée par l'utilisateur
  "expired",          // délai dépassé
]);

export const discountTypeEnum = pgEnum("discount_type", ["percent", "amount", "fixed_price"]);

export const aiFeatureEnum = pgEnum("ai_feature", [
  "mission_assist",
  "brainstorm",
  "rephrase",
  "structure",
  "analyze",
  "document",
  "explain",
]);
export const purchaseKindEnum = pgEnum("purchase_kind", ["pathway", "premium", "resource"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "expired",
  "trialing",
]);
export const duelStatusEnum = pgEnum("duel_status", [
  "pending",
  "in_progress",
  "completed",
  "declined",
  "expired",
]);
export const reportStatusEnum = pgEnum("report_status", ["open", "reviewing", "resolved", "dismissed"]);
export const moderationActionEnum = pgEnum("moderation_action", [
  "hide",
  "unhide",
  "delete",
  "lock",
  "unlock",
  "pin",
  "unpin",
  "suspend_user",
  "restore_user",
]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "pending", "closed"]);
export const senderRoleEnum = pgEnum("sender_role", ["user", "staff", "ai"]);

/* ------------------------------------------------------------------ *
 * 2. Identité & accès
 * ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: id(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    passwordHash: text("password_hash"),
    name: varchar("name", { length: 120 }),
    avatarUrl: text("avatar_url"),
    role: roleEnum("role").notNull().default("user"),
    onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    isBanned: boolean("is_banned").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email), index("users_role_idx").on(t.role)],
);

/** Données d'onboarding : uniquement ce qui sert réellement à personnaliser. */
/* profils */
export const profiles = pgTable(
  "profiles",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 80 }),
    bio: text("bio"),
    domain: varchar("domain", { length: 80 }),
    level: levelEnum("level").default("debutant"),
    interests: jsonb("interests").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    goalIds: jsonb("goal_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    currentGoalId: varchar("current_goal_id", { length: 32 }),
    country: varchar("country", { length: 64 }),
    preferences: jsonb("preferences")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("profiles_user_idx").on(t.userId)],
);

/** Sessions opaques : on ne stocke que le hash SHA-256 du token. */
export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    userAgent: text("user_agent"),
    ip: varchar("ip", { length: 64 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("sessions_token_idx").on(t.tokenHash),
    index("sessions_user_idx").on(t.userId),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: id(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    purpose: varchar("purpose", { length: 40 }).notNull(), // email_verification | password_reset
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("verification_token_idx").on(t.tokenHash),
    index("verification_identifier_idx").on(t.identifier),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorId: varchar("actor_id", { length: 32 }).references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 80 }).notNull(),
    entity: varchar("entity", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId), index("audit_actor_idx").on(t.actorId)],
);

/* ------------------------------------------------------------------ *
 * 3. Contenu
 * ------------------------------------------------------------------ */

export const categories = pgTable(
  "categories",
  {
    id: id(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default("Sparkles"),
    color: varchar("color", { length: 20 }).notNull().default("or"),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

/** « Que veux-tu accomplir ? » — entièrement administrable. */
export const goals = pgTable(
  "goals",
  {
    id: id(),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    tagline: varchar("tagline", { length: 220 }).notNull().default(""),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default("Target"),
    outcome: text("outcome").notNull().default(""),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("goals_slug_idx").on(t.slug), index("goals_active_idx").on(t.isActive)],
);

export const pathways = pgTable(
  "pathways",
  {
    id: id(),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    summary: varchar("summary", { length: 300 }).notNull().default(""),
    description: text("description").notNull().default(""),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    level: levelEnum("level").notNull().default("debutant"),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    expectedResult: text("expected_result").notNull().default(""),
    accessType: accessTypeEnum("access_type").notNull().default("free"),
    priceXof: integer("price_xof").notNull().default(0),
    imageUrl: text("image_url"),
    accentColor: varchar("accent_color", { length: 20 }).notNull().default("braise"),
    position: integer("position").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("pathways_slug_idx").on(t.slug),
    index("pathways_published_idx").on(t.isPublished),
    index("pathways_access_idx").on(t.accessType),
  ],
);

export const goalPathways = pgTable(
  "goal_pathways",
  {
    goalId: varchar("goal_id", { length: 32 })
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    pathwayId: varchar("pathway_id", { length: 32 })
      .notNull()
      .references(() => pathways.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.goalId, t.pathwayId] })],
);

/** Un champ de mission : c'est ce qui rend la mission productive. */
export type MissionField = {
  key: string;
  type:
    | "short_text"
    | "long_text"
    | "single_choice"
    | "multi_choice"
    | "number"
    | "date"
    | "file";
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
};

export type MissionPrompt = { title: string; body: string };

export const missions = pgTable(
  "missions",
  {
    id: id(),
    pathwayId: varchar("pathway_id", { length: 32 })
      .notNull()
      .references(() => pathways.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    objective: text("objective").notNull().default(""),
    explanation: text("explanation").notNull().default(""),
    instructions: jsonb("instructions").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    fields: jsonb("fields").$type<MissionField[]>().notNull().default(sql`'[]'::jsonb`),
    prompts: jsonb("prompts").$type<MissionPrompt[]>().notNull().default(sql`'[]'::jsonb`),
    toolIds: jsonb("tool_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    resourceIds: jsonb("resource_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    tips: jsonb("tips").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    pitfalls: jsonb("pitfalls").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    checklist: jsonb("checklist").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    resultLabel: varchar("result_label", { length: 200 }).notNull().default(""),
    aiAssist: boolean("ai_assist").notNull().default(false),
    aiPromptTemplate: text("ai_prompt_template"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(20),
    position: integer("position").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("missions_slug_idx").on(t.slug),
    index("missions_pathway_idx").on(t.pathwayId, t.position),
  ],
);

export const resources = pgTable(
  "resources",
  {
    id: id(),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    type: resourceTypeEnum("type").notNull().default("article"),
    url: text("url"),
    fileUrl: text("file_url"),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    accessType: accessTypeEnum("access_type").notNull().default("free"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("resources_slug_idx").on(t.slug)],
);

export const tools = pgTable(
  "tools",
  {
    id: id(),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    url: text("url").notNull(),
    pricing: varchar("pricing", { length: 160 }).notNull().default(""),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    useCases: jsonb("use_cases").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    features: jsonb("features").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    howToUse: jsonb("how_to_use").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    logoUrl: text("logo_url"),
    isFree: boolean("is_free").notNull().default(true),
    isPublished: boolean("is_published").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    level: levelEnum("level").notNull().default("debutant"),
    officialUrl: text("official_url"),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("tools_slug_idx").on(t.slug)],
);

export const prompts = pgTable(
  "prompts",
  {
    id: id(),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    accessType: accessTypeEnum("access_type").notNull().default("free"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("prompts_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------------ *
 * 4. Activité
 * ------------------------------------------------------------------ */

export const missionResponses = pgTable(
  "mission_responses",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: varchar("mission_id", { length: 32 })
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    answers: jsonb("answers")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    checkedItems: jsonb("checked_items").$type<number[]>().notNull().default(sql`'[]'::jsonb`),
    aiOutput: text("ai_output"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("mission_response_uniq").on(t.userId, t.missionId)],
);

export const missionProgress = pgTable(
  "mission_progress",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: varchar("mission_id", { length: 32 })
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    pathwayId: varchar("pathway_id", { length: 32 })
      .notNull()
      .references(() => pathways.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("mission_progress_uniq").on(t.userId, t.missionId),
    index("mission_progress_pathway_idx").on(t.userId, t.pathwayId),
  ],
);

export const pathwayProgress = pgTable(
  "pathway_progress",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pathwayId: varchar("pathway_id", { length: 32 })
      .notNull()
      .references(() => pathways.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("in_progress"),
    completedCount: integer("completed_count").notNull().default(0),
    totalCount: integer("total_count").notNull().default(0),
    percent: integer("percent").notNull().default(0),
    currentMissionId: varchar("current_mission_id", { length: 32 }),
    startedAt: createdAt(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("pathway_progress_uniq").on(t.userId, t.pathwayId),
    index("pathway_progress_user_idx").on(t.userId, t.lastActivityAt),
  ],
);

export const results = pgTable(
  "results",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: resultTypeEnum("type").notNull().default("mission"),
    title: varchar("title", { length: 240 }).notNull(),
    summary: text("summary").notNull().default(""),
    content: jsonb("content")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    missionId: varchar("mission_id", { length: 32 }).references(() => missions.id, {
      onDelete: "set null",
    }),
    pathwayId: varchar("pathway_id", { length: 32 }).references(() => pathways.id, {
      onDelete: "set null",
    }),
    isPinned: boolean("is_pinned").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("results_user_idx").on(t.userId, t.createdAt)],
);

export const documents = pgTable(
  "documents",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: varchar("result_id", { length: 32 }).references(() => results.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 240 }).notNull(),
    format: documentFormatEnum("format").notNull().default("markdown"),
    body: text("body"),
    fileUrl: text("file_url"),
    createdAt: createdAt(),
  },
  (t) => [index("documents_user_idx").on(t.userId, t.createdAt)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(), // pathway | mission | tool | prompt | resource
    entityId: varchar("entity_id", { length: 32 }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("favorites_uniq").on(t.userId, t.entityType, t.entityId),
    index("favorites_user_idx").on(t.userId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull().default("system"),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull().default(""),
    link: text("link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.readAt)],
);

/* ------------------------------------------------------------------ *
 * 5. Communauté
 * ------------------------------------------------------------------ */

export const discussions = pgTable(
  "discussions",
  {
    id: id(),
    authorId: varchar("author_id", { length: 32 }).references(() => users.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 240 }).notNull(),
    body: text("body").notNull(),
    categoryId: varchar("category_id", { length: 32 }).references(() => categories.id, {
      onDelete: "set null",
    }),
    replyCount: integer("reply_count").notNull().default(0),
    followerCount: integer("follower_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    // Masquer conserve le contenu pour la modération ; supprimer efface.
    isHidden: boolean("is_hidden").notNull().default(false),
    hiddenReason: varchar("hidden_reason", { length: 200 }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("discussions_activity_idx").on(t.lastActivityAt)],
);

export const discussionReplies = pgTable(
  "discussion_replies",
  {
    id: id(),
    discussionId: varchar("discussion_id", { length: 32 })
      .notNull()
      .references(() => discussions.id, { onDelete: "cascade" }),
    authorId: varchar("author_id", { length: 32 }).references(() => users.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    parentId: varchar("parent_id", { length: 32 }),
    isAnswer: boolean("is_answer").notNull().default(false),
    isHidden: boolean("is_hidden").notNull().default(false),
    hiddenReason: varchar("hidden_reason", { length: 200 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("replies_discussion_idx").on(t.discussionId, t.createdAt)],
);

export const reactions = pgTable(
  "reactions",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 30 }).notNull(), // discussion | reply
    entityId: varchar("entity_id", { length: 32 }).notNull(),
    emoji: varchar("emoji", { length: 16 }).notNull().default("👍"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("reactions_uniq").on(t.userId, t.entityType, t.entityId, t.emoji)],
);

export const reports = pgTable(
  "reports",
  {
    id: id(),
    reporterId: varchar("reporter_id", { length: 32 }).references(() => users.id, {
      onDelete: "set null",
    }),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: varchar("entity_id", { length: 32 }).notNull(),
    reason: varchar("reason", { length: 200 }).notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("open"),
    handledBy: varchar("handled_by", { length: 32 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("reports_status_idx").on(t.status)],
);

/* ------------------------------------------------------------------ *
 * 6. Arène
 * ------------------------------------------------------------------ */

export const games = pgTable(
  "games",
  {
    id: id(),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default("Swords"),
    level: levelEnum("level").notNull().default("debutant"),
    accessType: accessTypeEnum("access_type").notNull().default("free"),
    position: integer("position").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("games_slug_idx").on(t.slug)],
);

export type ChallengeQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const challenges = pgTable(
  "challenges",
  {
    id: id(),
    gameId: varchar("game_id", { length: 32 })
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    questions: jsonb("questions").$type<ChallengeQuestion[]>().notNull().default(sql`'[]'::jsonb`),
    durationSeconds: integer("duration_seconds").notNull().default(120),
    points: integer("points").notNull().default(10),
    position: integer("position").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("challenges_game_idx").on(t.gameId, t.position)],
);

export const challengeAttempts = pgTable(
  "challenge_attempts",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challengeId: varchar("challenge_id", { length: 32 })
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    answers: jsonb("answers").$type<number[]>().notNull().default(sql`'[]'::jsonb`),
    score: integer("score").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    totalCount: integer("total_count").notNull().default(0),
    durationSeconds: integer("duration_seconds"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("attempts_user_idx").on(t.userId, t.createdAt),
    index("attempts_challenge_idx").on(t.challengeId, t.score),
  ],
);

export const duels = pgTable(
  "duels",
  {
    id: id(),
    challengeId: varchar("challenge_id", { length: 32 })
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    challengerId: varchar("challenger_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opponentId: varchar("opponent_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challengerAttemptId: varchar("challenger_attempt_id", { length: 32 }),
    opponentAttemptId: varchar("opponent_attempt_id", { length: 32 }),
    winnerId: varchar("winner_id", { length: 32 }),
    status: duelStatusEnum("status").notNull().default("pending"),
    createdAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("duels_users_idx").on(t.challengerId, t.opponentId)],
);

/* ------------------------------------------------------------------ *
 * 7. Monétisation
 * ------------------------------------------------------------------ */

export const payments = pgTable(
  "payments",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull().default("kkiapay"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amountXof: integer("amount_xof").notNull(),
    transactionId: varchar("transaction_id", { length: 120 }),
    kind: purchaseKindEnum("kind").notNull().default("pathway"),
    targetId: varchar("target_id", { length: 32 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("payments_transaction_idx").on(t.transactionId),
    index("payments_user_idx").on(t.userId, t.status),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: purchaseKindEnum("kind").notNull().default("pathway"),
    pathwayId: varchar("pathway_id", { length: 32 }).references(() => pathways.id, {
      onDelete: "cascade",
    }),
    paymentId: varchar("payment_id", { length: 32 }).references(() => payments.id, {
      onDelete: "set null",
    }),
    amountXof: integer("amount_xof").notNull().default(0),
    grantedBy: varchar("granted_by", { length: 32 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("purchases_user_idx").on(t.userId),
    uniqueIndex("purchases_user_pathway_idx").on(t.userId, t.pathwayId),
  ],
);

/**
 * Commande — le pivot commercial.
 *
 * Elle fige le prix au moment de l'achat (`amountXof`) : une promotion qui
 * expire ou un changement de tarif ne doit jamais modifier rétroactivement ce
 * qu'une personne doit payer. La référence lisible (XWE-2026-XXXX) est ce que
 * l'utilisateur inscrit dans son message MoMo.
 */
export const orders = pgTable(
  "orders",
  {
    id: id(),
    reference: varchar("reference", { length: 24 }).notNull(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: purchaseKindEnum("kind").notNull().default("pathway"),
    pathwayId: varchar("pathway_id", { length: 32 }).references(() => pathways.id, {
      onDelete: "set null",
    }),
    status: orderStatusEnum("status").notNull().default("draft"),

    // Prix figé : listPriceXof = tarif catalogue, amountXof = à payer.
    listPriceXof: integer("list_price_xof").notNull().default(0),
    amountXof: integer("amount_xof").notNull().default(0),
    promotionId: varchar("promotion_id", { length: 32 }),

    // Ce que l'utilisateur déclare après avoir payé.
    payerNumber: varchar("payer_number", { length: 32 }),
    declaredAmountXof: integer("declared_amount_xof"),
    declaredReference: varchar("declared_reference", { length: 120 }),
    declaredAt: timestamp("declared_at", { withTimezone: true }),
    proofUrl: text("proof_url"),
    payeeNumber: varchar("payee_number", { length: 32 }),

    // Traitement par l'administration.
    reviewedBy: varchar("reviewed_by", { length: 32 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),

    paymentId: varchar("payment_id", { length: 32 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("orders_reference_idx").on(t.reference),
    index("orders_status_idx").on(t.status, t.createdAt),
    index("orders_user_idx").on(t.userId, t.createdAt),
  ],
);

/** Journal d'une commande : qui a fait quoi, quand. Jamais modifié. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: varchar("order_id", { length: 32 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    actorId: varchar("actor_id", { length: 32 }),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId, t.createdAt)],
);

/**
 * Numéros MoMo qui reçoivent les paiements. Administrables : jamais en dur
 * dans le code, conformément à la règle produit.
 */
export const paymentNumbers = pgTable(
  "payment_numbers",
  {
    id: id(),
    label: varchar("label", { length: 80 }).notNull().default("MTN MoMo"),
    number: varchar("number", { length: 32 }).notNull(),
    holderName: varchar("holder_name", { length: 120 }),
    provider: varchar("provider", { length: 40 }).notNull().default("mtn_momo"),
    isPrimary: boolean("is_primary").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("payment_numbers_active_idx").on(t.isActive, t.position)],
);

/**
 * Promotion : soit globale, soit rattachée à un parcours. Le moteur de prix
 * (lib/pricing.ts) est seul juge de son application.
 */
export const promotions = pgTable(
  "promotions",
  {
    id: id(),
    code: varchar("code", { length: 40 }),
    label: varchar("label", { length: 160 }).notNull(),
    pathwayId: varchar("pathway_id", { length: 32 }).references(() => pathways.id, {
      onDelete: "cascade",
    }),
    appliesToPremium: boolean("applies_to_premium").notNull().default(false),
    discountType: discountTypeEnum("discount_type").notNull().default("percent"),
    discountValue: integer("discount_value").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    maxRedemptions: integer("max_redemptions"),
    redemptions: integer("redemptions").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: varchar("created_by", { length: 32 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("promotions_active_idx").on(t.isActive, t.endsAt)],
);

/** Historique des prix : exigé par l'administration, et utile en litige. */
export const priceHistory = pgTable(
  "price_history",
  {
    id: id(),
    pathwayId: varchar("pathway_id", { length: 32 }).references(() => pathways.id, {
      onDelete: "cascade",
    }),
    scope: varchar("scope", { length: 30 }).notNull().default("pathway"), // pathway | premium
    oldPriceXof: integer("old_price_xof").notNull().default(0),
    newPriceXof: integer("new_price_xof").notNull().default(0),
    reason: varchar("reason", { length: 200 }),
    changedBy: varchar("changed_by", { length: 32 }),
    createdAt: createdAt(),
  },
  (t) => [index("price_history_pathway_idx").on(t.pathwayId, t.createdAt)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").notNull().default("free"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    grantedBy: varchar("granted_by", { length: 32 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("subscriptions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ *
 * 8. Plateforme
 * ------------------------------------------------------------------ */

/**
 * Chaque appel IA est enregistré : c'est ce qui rend les quotas applicables
 * et la dépense mesurable. On stocke des compteurs, jamais le contenu produit.
 */
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    feature: aiFeatureEnum("feature").notNull(),
    provider: varchar("provider", { length: 40 }).notNull().default("offline"),
    model: varchar("model", { length: 80 }),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    missionId: varchar("mission_id", { length: 32 }),
    ok: boolean("ok").notNull().default(true),
    errorCode: varchar("error_code", { length: 60 }),
    createdAt: createdAt(),
  },
  (t) => [
    index("ai_usage_user_idx").on(t.userId, t.createdAt),
    index("ai_usage_feature_idx").on(t.feature, t.createdAt),
  ],
);

/**
 * Quotas IA par plan, administrables. Une ligne par couple (plan, feature) ;
 * l'absence de ligne signifie « valeur par défaut du code ».
 */
export const aiQuotas = pgTable(
  "ai_quotas",
  {
    id: id(),
    plan: subscriptionPlanEnum("plan").notNull().default("free"),
    feature: aiFeatureEnum("feature").notNull(),
    dailyLimit: integer("daily_limit").notNull().default(10),
    monthlyLimit: integer("monthly_limit").notNull().default(100),
    isEnabled: boolean("is_enabled").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("ai_quotas_uniq").on(t.plan, t.feature)],
);

/** Avantages Premium administrables : le marketing ne passe pas par le code. */
export const premiumBenefits = pgTable(
  "premium_benefits",
  {
    id: id(),
    label: varchar("label", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default("Sparkles"),
    position: integer("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("premium_benefits_position_idx").on(t.position)],
);

/* ------------------------------------------------------------------ *
 * Arène : badges
 * ------------------------------------------------------------------ */

export const badges = pgTable(
  "badges",
  {
    id: id(),
    slug: varchar("slug", { length: 80 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 60 }).notNull().default("Trophy"),
    // Règle d'obtention, interprétée par lib/services/badges.ts
    ruleType: varchar("rule_type", { length: 40 }).notNull().default("missions_completed"),
    threshold: integer("threshold").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("badges_slug_idx").on(t.slug)],
);

export const userBadges = pgTable(
  "user_badges",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: varchar("badge_id", { length: 32 })
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: createdAt(),
  },
  (t) => [uniqueIndex("user_badges_uniq").on(t.userId, t.badgeId)],
);

/* ------------------------------------------------------------------ *
 * Communauté : suivis et modération
 * ------------------------------------------------------------------ */

export const discussionFollows = pgTable(
  "discussion_follows",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    discussionId: varchar("discussion_id", { length: 32 })
      .notNull()
      .references(() => discussions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("discussion_follows_uniq").on(t.userId, t.discussionId)],
);

/** Trace de modération : distincte de l'audit général, consultable par équipe. */
export const moderationLogs = pgTable(
  "moderation_logs",
  {
    id: id(),
    moderatorId: varchar("moderator_id", { length: 32 }),
    action: moderationActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: varchar("entity_id", { length: 32 }).notNull(),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [index("moderation_logs_idx").on(t.entityType, t.createdAt)],
);

export const legalPages = pgTable(
  "legal_pages",
  {
    id: id(),
    slug: varchar("slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull().default(""),
    isPublished: boolean("is_published").notNull().default(true),
    updatedAt: updatedAt(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("legal_slug_idx").on(t.slug)],
);

export const faqItems = pgTable(
  "faq_items",
  {
    id: id(),
    question: varchar("question", { length: 300 }).notNull(),
    answer: text("answer").notNull(),
    category: varchar("category", { length: 80 }).notNull().default("Général"),
    position: integer("position").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("faq_position_idx").on(t.position)],
);

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 20 }).primaryKey().default("singleton"),
  premiumPriceXof: integer("premium_price_xof").notNull().default(5500),
  selfServePremium: boolean("self_serve_premium").notNull().default(true),
  supportEmail: varchar("support_email", { length: 200 }).notNull().default("contact@xwe-ia.com"),
  announcement: text("announcement"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  updatedAt: updatedAt(),
});

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: id(),
    userId: varchar("user_id", { length: 32 }).references(() => users.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 240 }).notNull(),
    email: varchar("email", { length: 255 }),
    status: ticketStatusEnum("status").notNull().default("open"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("tickets_status_idx").on(t.status, t.updatedAt)],
);

export const supportMessages = pgTable(
  "support_messages",
  {
    id: id(),
    ticketId: varchar("ticket_id", { length: 32 })
      .notNull()
      .references(() => supportTickets.id, { onDelete: "cascade" }),
    senderRole: senderRoleEnum("sender_role").notNull().default("user"),
    authorId: varchar("author_id", { length: 32 }).references(() => users.id, {
      onDelete: "set null",
    }),
    authorName: varchar("author_name", { length: 120 }).notNull().default("Utilisateur"),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("support_messages_ticket_idx").on(t.ticketId, t.createdAt)],
);

/* ------------------------------------------------------------------ *
 * Relations
 * ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  pathwayProgress: many(pathwayProgress),
  results: many(results),
  favorites: many(favorites),
  notifications: many(notifications),
}));

export const pathwaysRelations = relations(pathways, ({ one, many }) => ({
  category: one(categories, { fields: [pathways.categoryId], references: [categories.id] }),
  missions: many(missions),
  goals: many(goalPathways),
}));

export const missionsRelations = relations(missions, ({ one }) => ({
  pathway: one(pathways, { fields: [missions.pathwayId], references: [pathways.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  category: one(categories, { fields: [goals.categoryId], references: [categories.id] }),
  pathways: many(goalPathways),
}));

export const goalPathwaysRelations = relations(goalPathways, ({ one }) => ({
  goal: one(goals, { fields: [goalPathways.goalId], references: [goals.id] }),
  pathway: one(pathways, { fields: [goalPathways.pathwayId], references: [pathways.id] }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, { fields: [discussions.authorId], references: [users.id] }),
  replies: many(discussionReplies),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one }) => ({
  discussion: one(discussions, {
    fields: [discussionReplies.discussionId],
    references: [discussions.id],
  }),
  author: one(users, { fields: [discussionReplies.authorId], references: [users.id] }),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  game: one(games, { fields: [challenges.gameId], references: [games.id] }),
}));

/* ------------------------------------------------------------------ *
 * Types inférés
 * ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Pathway = typeof pathways.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type MissionResponse = typeof missionResponses.$inferSelect;
export type PathwayProgress = typeof pathwayProgress.$inferSelect;
export type MissionProgress = typeof missionProgress.$inferSelect;
export type Result = typeof results.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Discussion = typeof discussions.$inferSelect;
export type DiscussionReply = typeof discussionReplies.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type LegalPage = typeof legalPages.$inferSelect;
export type FaqItem = typeof faqItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type PaymentNumber = typeof paymentNumbers.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type AiUsage = typeof aiUsage.$inferSelect;
export type AiQuota = typeof aiQuotas.$inferSelect;
export type PremiumBenefit = typeof premiumBenefits.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type DiscountType = (typeof discountTypeEnum.enumValues)[number];
export type AiFeature = (typeof aiFeatureEnum.enumValues)[number];
export type ModerationAction = (typeof moderationActionEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];
export type AccessType = (typeof accessTypeEnum.enumValues)[number];
export type Level = (typeof levelEnum.enumValues)[number];
