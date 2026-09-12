import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const questionStatus = pgEnum("question_status", [
  "pending",
  "answered",
  "rejected",
]);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Self-reference: set when this question is a public follow-up to an
    // already-answered question. Null for root questions.
    parentId: uuid("parent_id").references((): AnyPgColumn => questions.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),
    answer: text("answer"),
    status: questionStatus("status").notNull().default("pending"),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (table) => [
    index("questions_status_answered_idx").on(table.status, table.answeredAt),
    index("questions_status_created_idx").on(table.status, table.createdAt),
    index("questions_ip_hash_created_idx").on(table.ipHash, table.createdAt),
    index("questions_parent_id_idx").on(table.parentId),
  ],
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

// Generic append-only log used for DB-backed rate limiting (question
// submissions, admin login attempts, ...). Rows older than ~25h are pruned
// opportunistically on insert so the table never grows unbounded.
export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("rate_limit_events_key_created_idx").on(table.key, table.createdAt),
  ],
);

// One row per wall page view. Privacy-preserving by construction: only a
// salted IP hash is stored (never a raw IP), same as elsewhere in this app.
// Kept indefinitely (unlike rate_limit_events) since it backs all-time
// visitor counts, not just short-lived abuse checks.
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ipHash: text("ip_hash").notNull(),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("page_views_viewed_at_idx").on(table.viewedAt),
    index("page_views_ip_hash_idx").on(table.ipHash),
  ],
);
