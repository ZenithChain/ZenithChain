import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";

export const faucetClaimsTable = pgTable(
  "faucet_claims",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("wallet_address").notNull(),
    amount: doublePrecision("amount").notNull(),
    txHash: text("tx_hash").notNull(),
    ip: text("ip"),
    claimedAt: timestamp("claimed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("faucet_wallet_idx").on(t.walletAddress, t.claimedAt),
    index("faucet_ip_idx").on(t.ip, t.claimedAt),
  ],
);

export type FaucetClaimRow = typeof faucetClaimsTable.$inferSelect;
