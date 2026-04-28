import { db } from "@workspace/db";
import {
  blocksTable,
  transactionsTable,
} from "@workspace/db/schema";
import { desc, sql } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

let lastEnsuredAt = 0;
const ENSURE_INTERVAL_MS = 12_000;

const SAMPLE_ADDRESSES = [
  "0x4f2a3c9d7b5e1f0a8c6d3b1e9f7a2c4d6b8e0f12",
  "0xd8c2e6f3a1b4c7d9e2f0a5b8c1d4e7f0a3b6c9d2",
  "0x7a3b1c5d8e0f2a4b6c9d0e1f3a5b7c9d1e3f5a70",
  "0x91b3d6f9c2e5a8b1d4f7a0c3e6b9d2f5a8b1c4e7",
  "0x2c4e6a8b0d2f4a6c8e0b2d4f6a8c0e2d4f6a8b00",
  "0xab12cd34ef567890ab12cd34ef567890ab12cd34",
  "0xfeedfacecafebeef00112233445566778899aabb",
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
];

function hashFor(seed: string): string {
  return (
    "0x" + createHash("sha256").update(seed).digest("hex")
  );
}

function pickAddr(seed: string): string {
  const idx =
    parseInt(createHash("md5").update(seed).digest("hex").slice(0, 6), 16) %
    SAMPLE_ADDRESSES.length;
  return SAMPLE_ADDRESSES[idx]!;
}

function genHash(): string {
  return "0x" + randomBytes(32).toString("hex");
}

export async function ensureLatestBlocks(): Promise<void> {
  const now = Date.now();
  if (now - lastEnsuredAt < ENSURE_INTERVAL_MS) return;
  lastEnsuredAt = now;

  // Find latest block
  const latest = await db
    .select()
    .from(blocksTable)
    .orderBy(desc(blocksTable.number))
    .limit(1);

  let nextNumber = latest[0] ? latest[0].number + 1 : 1_842_300;
  let lastTimestamp = latest[0] ? latest[0].timestamp.getTime() : now - 60_000;

  // Generate up to 5 new blocks if we're behind
  const blocksToInsert: (typeof blocksTable.$inferInsert)[] = [];
  const txsToInsert: (typeof transactionsTable.$inferInsert)[] = [];

  // Cap how far we go
  const targetCount = 5;
  for (let i = 0; i < targetCount; i++) {
    const blockTimestamp = new Date(lastTimestamp + 12_000);
    if (blockTimestamp.getTime() > now) break;
    lastTimestamp = blockTimestamp.getTime();
    const blockHash = hashFor(`block:${nextNumber}`);
    const txCount = 1 + Math.floor(Math.random() * 4);
    let gasUsed = 0n;
    for (let j = 0; j < txCount; j++) {
      const txHash = genHash();
      const value = BigInt(Math.floor(Math.random() * 5_000_000_000_000_000));
      const gasPrice = BigInt(1_000_000_000 + Math.floor(Math.random() * 5_000_000_000));
      const gasUsedTx = BigInt(21_000 + Math.floor(Math.random() * 80_000));
      gasUsed += gasUsedTx;
      txsToInsert.push({
        hash: txHash,
        blockNumber: nextNumber,
        fromAddr: pickAddr(`from:${txHash}`),
        toAddr: pickAddr(`to:${txHash}`),
        valueWei: value,
        gasPriceWei: gasPrice,
        status: Math.random() < 0.97 ? "success" : "failed",
        timestamp: blockTimestamp,
      });
    }
    blocksToInsert.push({
      number: nextNumber,
      hash: blockHash,
      miner: pickAddr(`miner:${nextNumber}`),
      txCount,
      gasUsed,
      timestamp: blockTimestamp,
    });
    nextNumber += 1;
  }

  if (blocksToInsert.length > 0) {
    await db.insert(blocksTable).values(blocksToInsert).onConflictDoNothing();
  }
  if (txsToInsert.length > 0) {
    await db.insert(transactionsTable).values(txsToInsert).onConflictDoNothing();
  }

  // Trim to last 200 blocks / 1000 txs to keep table small
  await db.execute(sql`
    DELETE FROM blocks
    WHERE number IN (
      SELECT number FROM blocks ORDER BY number DESC OFFSET 200
    )
  `);
  await db.execute(sql`
    DELETE FROM transactions
    WHERE hash IN (
      SELECT hash FROM transactions ORDER BY timestamp DESC OFFSET 1000
    )
  `);
}
