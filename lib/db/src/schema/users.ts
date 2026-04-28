import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    walletAddress: text("wallet_address").primaryKey(),
    zp: integer("zp").notNull().default(0),
    activityScore: doublePrecision("activity_score").notNull().default(0),
    reputationScore: doublePrecision("reputation_score").notNull().default(1),
    txCount: integer("tx_count").notNull().default(0),
    uniqueContracts: integer("unique_contracts").notNull().default(0),
    streakCount: integer("streak_count").notNull().default(0),
    lastCheckin: timestamp("last_checkin", { withTimezone: true }),
    lastClaim: timestamp("last_claim", { withTimezone: true }),
    referralCode: text("referral_code").notNull().unique(),
    invitedBy: text("invited_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("users_zp_idx").on(t.zp),
    index("users_referral_code_idx").on(t.referralCode),
  ],
);

export type UserRow = typeof usersTable.$inferSelect;
export type InsertUserRow = typeof usersTable.$inferInsert;
