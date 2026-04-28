import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  activityLogsTable,
  faucetClaimsTable,
  boxOpeningsTable,
  userMissionsTable,
  transactionsTable,
} from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import {
  GetGlobalStatsResponse,
  GetNetworkConfigResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import { ZENITH_NETWORK } from "../lib/zenith";

const router: IRouter = Router();

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [users, txs, zp, missions, claims, boxes] = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ c: sql<number>`count(*)::int` }).from(transactionsTable),
      db
        .select({ s: sql<number>`coalesce(sum(zp_delta), 0)::int` })
        .from(activityLogsTable),
      db.select({ c: sql<number>`count(*)::int` }).from(userMissionsTable),
      db.select({ c: sql<number>`count(*)::int` }).from(faucetClaimsTable),
      db.select({ c: sql<number>`count(*)::int` }).from(boxOpeningsTable),
    ]);

    const data = GetGlobalStatsResponse.parse({
      totalUsers: users[0]?.c ?? 0,
      totalTransactions: txs[0]?.c ?? 0,
      totalZpAwarded: zp[0]?.s ?? 0,
      totalMissionsCompleted: missions[0]?.c ?? 0,
      totalFaucetClaims: claims[0]?.c ?? 0,
      totalBoxesOpened: boxes[0]?.c ?? 0,
    });
    res.json(data);
  }),
);

router.get(
  "/network",
  asyncHandler(async (_req, res) => {
    const data = GetNetworkConfigResponse.parse({
      chainId: ZENITH_NETWORK.chainId,
      chainIdDec: ZENITH_NETWORK.chainIdDec,
      chainName: ZENITH_NETWORK.chainName,
      rpcUrl: ZENITH_NETWORK.rpcUrl,
      blockExplorerUrl: ZENITH_NETWORK.blockExplorerUrl,
      currencySymbol: ZENITH_NETWORK.currencySymbol,
      currencyName: ZENITH_NETWORK.currencyName,
      decimals: ZENITH_NETWORK.decimals,
      totalSupply: ZENITH_NETWORK.totalSupply,
    });
    res.json(data);
  }),
);

export default router;
