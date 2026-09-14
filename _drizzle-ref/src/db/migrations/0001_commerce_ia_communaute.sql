CREATE TYPE "public"."ai_feature" AS ENUM('mission_assist', 'brainstorm', 'rephrase', 'structure', 'analyze', 'document', 'explain');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percent', 'amount', 'fixed_price');--> statement-breakpoint
CREATE TYPE "public"."moderation_action" AS ENUM('hide', 'unhide', 'delete', 'lock', 'unlock', 'pin', 'unpin', 'suspend_user', 'restore_user');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'awaiting_payment', 'declared', 'under_review', 'confirmed', 'rejected', 'canceled', 'expired');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'premium' BEFORE 'support';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'resource' BEFORE 'support';--> statement-breakpoint
ALTER TYPE "public"."payment_provider" ADD VALUE 'momo_manual' BEFORE 'kkiapay';--> statement-breakpoint
ALTER TYPE "public"."payment_provider" ADD VALUE 'momo_api' BEFORE 'kkiapay';--> statement-breakpoint
CREATE TABLE "ai_quotas" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"daily_limit" integer DEFAULT 10 NOT NULL,
	"monthly_limit" integer DEFAULT 100 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"provider" varchar(40) DEFAULT 'offline' NOT NULL,
	"model" varchar(80),
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"mission_id" varchar(32),
	"ok" boolean DEFAULT true NOT NULL,
	"error_code" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"label" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(60) DEFAULT 'Trophy' NOT NULL,
	"rule_type" varchar(40) DEFAULT 'missions_completed' NOT NULL,
	"threshold" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_follows" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"discussion_id" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_logs" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"moderator_id" varchar(32),
	"action" "moderation_action" NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" varchar(32) NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"order_id" varchar(32) NOT NULL,
	"status" "order_status" NOT NULL,
	"note" text,
	"actor_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"reference" varchar(24) NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"kind" "purchase_kind" DEFAULT 'pathway' NOT NULL,
	"pathway_id" varchar(32),
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"list_price_xof" integer DEFAULT 0 NOT NULL,
	"amount_xof" integer DEFAULT 0 NOT NULL,
	"promotion_id" varchar(32),
	"payer_number" varchar(32),
	"declared_amount_xof" integer,
	"declared_reference" varchar(120),
	"declared_at" timestamp with time zone,
	"proof_url" text,
	"payee_number" varchar(32),
	"reviewed_by" varchar(32),
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"payment_id" varchar(32),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_numbers" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"label" varchar(80) DEFAULT 'MTN MoMo' NOT NULL,
	"number" varchar(32) NOT NULL,
	"holder_name" varchar(120),
	"provider" varchar(40) DEFAULT 'mtn_momo' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "premium_benefits" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"label" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(60) DEFAULT 'Sparkles' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"pathway_id" varchar(32),
	"scope" varchar(30) DEFAULT 'pathway' NOT NULL,
	"old_price_xof" integer DEFAULT 0 NOT NULL,
	"new_price_xof" integer DEFAULT 0 NOT NULL,
	"reason" varchar(200),
	"changed_by" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"code" varchar(40),
	"label" varchar(160) NOT NULL,
	"pathway_id" varchar(32),
	"applies_to_premium" boolean DEFAULT false NOT NULL,
	"discount_type" "discount_type" DEFAULT 'percent' NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"max_redemptions" integer,
	"redemptions" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"badge_id" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD COLUMN "hidden_reason" varchar(200);--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN "follower_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN "hidden_reason" varchar(200);--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "level" "level" DEFAULT 'debutant' NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "official_url" text;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_follows" ADD CONSTRAINT "discussion_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_follows" ADD CONSTRAINT "discussion_follows_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_quotas_uniq" ON "ai_quotas" USING btree ("plan","feature");--> statement-breakpoint
CREATE INDEX "ai_usage_user_idx" ON "ai_usage" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_feature_idx" ON "ai_usage" USING btree ("feature","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_slug_idx" ON "badges" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "discussion_follows_uniq" ON "discussion_follows" USING btree ("user_id","discussion_id");--> statement-breakpoint
CREATE INDEX "moderation_logs_idx" ON "moderation_logs" USING btree ("entity_type","created_at");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_reference_idx" ON "orders" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_numbers_active_idx" ON "payment_numbers" USING btree ("is_active","position");--> statement-breakpoint
CREATE INDEX "premium_benefits_position_idx" ON "premium_benefits" USING btree ("position");--> statement-breakpoint
CREATE INDEX "price_history_pathway_idx" ON "price_history" USING btree ("pathway_id","created_at");--> statement-breakpoint
CREATE INDEX "promotions_active_idx" ON "promotions" USING btree ("is_active","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_uniq" ON "user_badges" USING btree ("user_id","badge_id");