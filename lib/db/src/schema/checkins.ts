import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  dayOfStreak: integer("day_of_streak").notNull(),
  zpAwarded: integer("zp_awarded").notNull(),
  bonusAwarded: integer("bonus_awarded").notNull().default(0),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CheckinRow = typeof checkinsTable.$inferSelect;
