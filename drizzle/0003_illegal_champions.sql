CREATE TABLE "question_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_likes" ADD CONSTRAINT "question_likes_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_likes_question_ip_unique" ON "question_likes" USING btree ("question_id","ip_hash");--> statement-breakpoint
CREATE INDEX "question_likes_question_id_idx" ON "question_likes" USING btree ("question_id");