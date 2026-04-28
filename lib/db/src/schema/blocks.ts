import {
  pgTable,
  text,
  integer,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const blocksTable = pgTable(
  "blocks",
  {
    number: integer("number").primaryKey(),
    hash: text("hash").notNull().unique(),
    miner: text("miner").notNull(),
    txCount: integer("tx_count").notNull().default(0),
    gasUsed: bigint("gas_used", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("blocks_timestamp_idx").on(t.timestamp)],
);

export type BlockRow = typeof blocksTable.$inferSelect;
export type InsertBlockRow = typeof blocksTable.$inferInsert;
