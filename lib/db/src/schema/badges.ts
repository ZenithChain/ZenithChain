import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const badgeClaimsTable = pgTable(
  "badge_claims",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("wallet_address").notNull(),
    badgeType: text("badge_type").notNull(), // 'pioneer' | 'genesis'
    txHash: text("tx_hash"),
    chainId: integer("chain_id"),
    position: integer("position").notNull(),
    claimedAt: timestamp("claimed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("badge_unique_per_wallet").on(t.walletAddress, t.badgeType),
  ],
);

export type BadgeClaimRow = typeof badgeClaimsTable.$inferSelect;
