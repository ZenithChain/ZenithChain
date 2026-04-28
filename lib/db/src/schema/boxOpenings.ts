import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const boxOpeningsTable = pgTable(
  "box_openings",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("wallet_address").notNull(),
    rarity: text("rarity").notNull(), // basic | rare | epic
    cost: integer("cost").notNull(),
    zpReward: integer("zp_reward").notNull(),
    isJackpot: boolean("is_jackpot").notNull().default(false),
    bonus: text("bonus"),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("box_openings_wallet_day_idx").on(
      t.walletAddress,
      t.rarity,
      t.openedAt,
    ),
  ],
);

export type BoxOpeningRow = typeof boxOpeningsTable.$inferSelect;
