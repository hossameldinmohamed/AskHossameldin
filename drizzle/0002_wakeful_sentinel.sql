CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "page_views_viewed_at_idx" ON "page_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "page_views_ip_hash_idx" ON "page_views" USING btree ("ip_hash");