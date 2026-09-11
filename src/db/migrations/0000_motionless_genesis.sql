CREATE TYPE "public"."access_type" AS ENUM('free', 'paid', 'premium');--> statement-breakpoint
CREATE TYPE "public"."document_format" AS ENUM('markdown', 'docx', 'pdf', 'txt');--> statement-breakpoint
CREATE TYPE "public"."duel_status" AS ENUM('pending', 'in_progress', 'completed', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'single_choice', 'multi_choice', 'number', 'date', 'file');--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('debutant', 'intermediaire', 'avance');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'mission', 'pathway', 'discussion', 'arena', 'payment', 'support');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('kkiapay', 'manual', 'offline');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."progress_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."purchase_kind" AS ENUM('pathway', 'premium', 'resource');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('article', 'video', 'pdf', 'template', 'link', 'checklist');--> statement-breakpoint
CREATE TYPE "public"."result_type" AS ENUM('mission', 'pathway', 'project', 'document');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'moderator', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."sender_role" AS ENUM('user', 'staff', 'ai');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'expired', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'closed');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"actor_id" varchar(32),
	"action" varchar(80) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(64),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(60) DEFAULT 'Sparkles' NOT NULL,
	"color" varchar(20) DEFAULT 'or' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_attempts" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"challenge_id" varchar(32) NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"duration_seconds" integer,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"game_id" varchar(32) NOT NULL,
	"title" varchar(200) NOT NULL,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration_seconds" integer DEFAULT 120 NOT NULL,
	"points" integer DEFAULT 10 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_replies" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"discussion_id" varchar(32) NOT NULL,
	"author_id" varchar(32),
	"body" text NOT NULL,
	"parent_id" varchar(32),
	"is_answer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"author_id" varchar(32),
	"title" varchar(240) NOT NULL,
	"body" text NOT NULL,
	"category_id" varchar(32),
	"reply_count" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"result_id" varchar(32),
	"title" varchar(240) NOT NULL,
	"format" "document_format" DEFAULT 'markdown' NOT NULL,
	"body" text,
	"file_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "duels" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"challenge_id" varchar(32) NOT NULL,
	"challenger_id" varchar(32) NOT NULL,
	"opponent_id" varchar(32) NOT NULL,
	"challenger_attempt_id" varchar(32),
	"opponent_attempt_id" varchar(32),
	"winner_id" varchar(32),
	"status" "duel_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "faq_items" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"question" varchar(300) NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(80) DEFAULT 'Général' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(60) DEFAULT 'Swords' NOT NULL,
	"level" "level" DEFAULT 'debutant' NOT NULL,
	"access_type" "access_type" DEFAULT 'free' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_pathways" (
	"goal_id" varchar(32) NOT NULL,
	"pathway_id" varchar(32) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "goal_pathways_goal_id_pathway_id_pk" PRIMARY KEY("goal_id","pathway_id")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(160) NOT NULL,
	"tagline" varchar(220) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" varchar(60) DEFAULT 'Target' NOT NULL,
	"outcome" text DEFAULT '' NOT NULL,
	"category_id" varchar(32),
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_pages" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_progress" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"mission_id" varchar(32) NOT NULL,
	"pathway_id" varchar(32) NOT NULL,
	"status" "progress_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_responses" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"mission_id" varchar(32) NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"checked_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_output" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"pathway_id" varchar(32) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" varchar(200) NOT NULL,
	"objective" text DEFAULT '' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"instructions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tool_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resource_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pitfalls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result_label" varchar(200) DEFAULT '' NOT NULL,
	"ai_assist" boolean DEFAULT false NOT NULL,
	"ai_prompt_template" text,
	"estimated_minutes" integer DEFAULT 20 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathway_progress" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"pathway_id" varchar(32) NOT NULL,
	"status" "progress_status" DEFAULT 'in_progress' NOT NULL,
	"completed_count" integer DEFAULT 0 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"percent" integer DEFAULT 0 NOT NULL,
	"current_mission_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pathways" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" varchar(300) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category_id" varchar(32),
	"level" "level" DEFAULT 'debutant' NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"expected_result" text DEFAULT '' NOT NULL,
	"access_type" "access_type" DEFAULT 'free' NOT NULL,
	"price_xof" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"accent_color" varchar(20) DEFAULT 'braise' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"provider" "payment_provider" DEFAULT 'kkiapay' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_xof" integer NOT NULL,
	"transaction_id" varchar(120),
	"kind" "purchase_kind" DEFAULT 'pathway' NOT NULL,
	"target_id" varchar(32),
	"metadata" jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"display_name" varchar(80),
	"bio" text,
	"domain" varchar(80),
	"level" "level" DEFAULT 'debutant',
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"goal_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_goal_id" varchar(32),
	"country" varchar(64),
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"category_id" varchar(32),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"access_type" "access_type" DEFAULT 'free' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"kind" "purchase_kind" DEFAULT 'pathway' NOT NULL,
	"pathway_id" varchar(32),
	"payment_id" varchar(32),
	"amount_xof" integer DEFAULT 0 NOT NULL,
	"granted_by" varchar(32),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" varchar(32) NOT NULL,
	"emoji" varchar(16) DEFAULT '👍' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"reporter_id" varchar(32),
	"entity_type" varchar(30) NOT NULL,
	"entity_id" varchar(32) NOT NULL,
	"reason" varchar(200) NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"handled_by" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"type" "resource_type" DEFAULT 'article' NOT NULL,
	"url" text,
	"file_url" text,
	"category_id" varchar(32),
	"access_type" "access_type" DEFAULT 'free' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"type" "result_type" DEFAULT 'mission' NOT NULL,
	"title" varchar(240) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"mission_id" varchar(32),
	"pathway_id" varchar(32),
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"user_agent" text,
	"ip" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" varchar(20) PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"premium_price_xof" integer DEFAULT 5500 NOT NULL,
	"self_serve_premium" boolean DEFAULT true NOT NULL,
	"support_email" varchar(200) DEFAULT 'contact@xwe-ia.com' NOT NULL,
	"announcement" text,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp with time zone,
	"granted_by" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"ticket_id" varchar(32) NOT NULL,
	"sender_role" "sender_role" DEFAULT 'user' NOT NULL,
	"author_id" varchar(32),
	"author_name" varchar(120) DEFAULT 'Utilisateur' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"user_id" varchar(32),
	"subject" varchar(240) NOT NULL,
	"email" varchar(255),
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"url" text NOT NULL,
	"pricing" varchar(160) DEFAULT '' NOT NULL,
	"category_id" varchar(32),
	"use_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"how_to_use" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"logo_url" text,
	"is_free" boolean DEFAULT true NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp with time zone,
	"password_hash" text,
	"name" varchar(120),
	"avatar_url" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"onboarded_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"is_banned" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"purpose" varchar(40) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD CONSTRAINT "challenge_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD CONSTRAINT "challenge_attempts_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duels" ADD CONSTRAINT "duels_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duels" ADD CONSTRAINT "duels_challenger_id_users_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duels" ADD CONSTRAINT "duels_opponent_id_users_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_pathways" ADD CONSTRAINT "goal_pathways_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_pathways" ADD CONSTRAINT "goal_pathways_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_progress" ADD CONSTRAINT "mission_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_progress" ADD CONSTRAINT "mission_progress_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_progress" ADD CONSTRAINT "mission_progress_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_responses" ADD CONSTRAINT "mission_responses_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_progress" ADD CONSTRAINT "pathway_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_progress" ADD CONSTRAINT "pathway_progress_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathways" ADD CONSTRAINT "pathways_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "attempts_user_idx" ON "challenge_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "attempts_challenge_idx" ON "challenge_attempts" USING btree ("challenge_id","score");--> statement-breakpoint
CREATE INDEX "challenges_game_idx" ON "challenges" USING btree ("game_id","position");--> statement-breakpoint
CREATE INDEX "replies_discussion_idx" ON "discussion_replies" USING btree ("discussion_id","created_at");--> statement-breakpoint
CREATE INDEX "discussions_activity_idx" ON "discussions" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "duels_users_idx" ON "duels" USING btree ("challenger_id","opponent_id");--> statement-breakpoint
CREATE INDEX "faq_position_idx" ON "faq_items" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_uniq" ON "favorites" USING btree ("user_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "favorites_user_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "games_slug_idx" ON "games" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "goals_slug_idx" ON "goals" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "goals_active_idx" ON "goals" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "legal_slug_idx" ON "legal_pages" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_progress_uniq" ON "mission_progress" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE INDEX "mission_progress_pathway_idx" ON "mission_progress" USING btree ("user_id","pathway_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mission_response_uniq" ON "mission_responses" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "missions_slug_idx" ON "missions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "missions_pathway_idx" ON "missions" USING btree ("pathway_id","position");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pathway_progress_uniq" ON "pathway_progress" USING btree ("user_id","pathway_id");--> statement-breakpoint
CREATE INDEX "pathway_progress_user_idx" ON "pathway_progress" USING btree ("user_id","last_activity_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pathways_slug_idx" ON "pathways" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "pathways_published_idx" ON "pathways" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "pathways_access_idx" ON "pathways" USING btree ("access_type");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompts_slug_idx" ON "prompts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "purchases_user_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_user_pathway_idx" ON "purchases" USING btree ("user_id","pathway_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_uniq" ON "reactions" USING btree ("user_id","entity_type","entity_id","emoji");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "results_user_idx" ON "results" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_messages_ticket_idx" ON "support_messages" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "support_tickets" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_token_idx" ON "verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification_tokens" USING btree ("identifier");