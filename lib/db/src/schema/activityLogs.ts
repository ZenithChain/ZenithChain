import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";

export const activityLogsTable = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("wallet_address").notNull(),
    action: text("action").notNull(),
    detail: text("detail"),
    zpDelta: integer("zp_delta").notNull().default(0),
    ip: text("ip"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("activity_logs_wallet_idx").on(t.walletAddress, t.timestamp),
  ],
);

export type ActivityLogRow = typeof activityLogsTable.$inferSelect;
