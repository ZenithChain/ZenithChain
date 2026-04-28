import {
  pgTable,
  text,
  integer,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const transactionsTable = pgTable(
  "transactions",
  {
    hash: text("hash").primaryKey(),
    blockNumber: integer("block_number").notNull(),
    fromAddr: text("from_addr").notNull(),
    toAddr: text("to_addr").notNull(),
    valueWei: bigint("value_wei", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    gasPriceWei: bigint("gas_price_wei", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    status: text("status").notNull().default("success"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("tx_block_idx").on(t.blockNumber),
    index("tx_from_idx").on(t.fromAddr),
    index("tx_to_idx").on(t.toAddr),
    index("tx_timestamp_idx").on(t.timestamp),
  ],
);

export type TransactionRow = typeof transactionsTable.$inferSelect;
export type InsertTransactionRow = typeof transactionsTable.$inferInsert;
