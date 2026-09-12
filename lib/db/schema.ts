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
