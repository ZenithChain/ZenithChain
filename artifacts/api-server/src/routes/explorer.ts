import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  blocksTable,
  transactionsTable,
} from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  ExplorerSearchQueryParams,
  ExplorerSearchResponse,
  GetLatestBlocksQueryParams,
  GetLatestBlocksResponse,
  GetLatestTransactionsQueryParams,
  GetLatestTransactionsResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import { ensureLatestBlocks } from "../lib/explorer";

const router: IRouter = Router();

function blockToJson(b: typeof blocksTable.$inferSelect) {
  return {
    number: b.number,
    hash: b.hash,
    timestamp: b.timestamp.toISOString(),
    txCount: b.txCount,
    gasUsed: b.gasUsed.toString(),
    miner: b.miner,
  };
}

function txToJson(t: typeof transactionsTable.$inferSelect) {
  return {
    hash: t.hash,
    blockNumber: t.blockNumber,
    from: t.fromAddr,
    to: t.toAddr,
    value: t.valueWei.toString(),
    gasPrice: t.gasPriceWei.toString(),
    timestamp: t.timestamp.toISOString(),
    status: t.status as "success" | "failed" | "pending",
  };
}

router.get(
  "/explorer/blocks",
  asyncHandler(async (req, res) => {
    const params = GetLatestBlocksQueryParams.parse(req.query);
    await ensureLatestBlocks();
    const limit = params.limit ?? 10;
    const rows = await db
      .select()
      .from(blocksTable)
      .orderBy(desc(blocksTable.number))
      .limit(limit);
    res.json(GetLatestBlocksResponse.parse(rows.map(blockToJson)));
  }),
);

router.get(
  "/explorer/transactions",
  asyncHandler(async (req, res) => {
    const params = GetLatestTransactionsQueryParams.parse(req.query);
    await ensureLatestBlocks();
    const limit = params.limit ?? 10;
    const rows = await db
      .select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.timestamp))
      .limit(limit);
    res.json(GetLatestTransactionsResponse.parse(rows.map(txToJson)));
  }),
);

router.get(
  "/explorer/search",
  asyncHandler(async (req, res) => {
    const params = ExplorerSearchQueryParams.parse(req.query);
    const q = params.q.trim();

    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      const tx = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.hash, q))
        .limit(1);
      if (tx[0]) {
        res.json(
          ExplorerSearchResponse.parse({
            kind: "tx",
            transaction: txToJson(tx[0]),
            block: null,
            address: null,
            recentTransactions: [],
          }),
        );
        return;
      }
    }

    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      const recent = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.fromAddr, q.toLowerCase()))
        .orderBy(desc(transactionsTable.timestamp))
        .limit(20);
      res.json(
        ExplorerSearchResponse.parse({
          kind: "address",
          address: q.toLowerCase(),
          block: null,
          transaction: null,
          recentTransactions: recent.map(txToJson),
        }),
      );
      return;
    }

    if (/^[0-9]+$/.test(q)) {
      const block = await db
        .select()
        .from(blocksTable)
        .where(eq(blocksTable.number, Number(q)))
        .limit(1);
      if (block[0]) {
        res.json(
          ExplorerSearchResponse.parse({
            kind: "block",
            block: blockToJson(block[0]),
            transaction: null,
            address: null,
            recentTransactions: [],
          }),
        );
        return;
      }
    }

    res.json(
      ExplorerSearchResponse.parse({
        kind: "none",
        block: null,
        transaction: null,
        address: null,
        recentTransactions: [],
      }),
    );
  }),
);

export default router;
