ALTER TABLE "questions" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_parent_id_questions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_parent_id_idx" ON "questions" USING btree ("parent_id");