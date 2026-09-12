CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'rejected');--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"answer" text,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rate_limit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "questions_status_answered_idx" ON "questions" USING btree ("status","answered_at");--> statement-breakpoint
CREATE INDEX "questions_status_created_idx" ON "questions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "questions_ip_hash_created_idx" ON "questions" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "rate_limit_events_key_created_idx" ON "rate_limit_events" USING btree ("key","created_at");