import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const userMissionsTable = pgTable(
  "user_missions",
  {
    walletAddress: text("wallet_address").notNull(),
    missionId: integer("mission_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.walletAddress, t.missionId] })],
);

export type UserMissionRow = typeof userMissionsTable.$inferSelect;
