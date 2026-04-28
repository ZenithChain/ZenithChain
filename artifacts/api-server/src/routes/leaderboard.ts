import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { desc, sql } from "drizzle-orm";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  computeActivityScore,
  computeFinalScore,
  tierForZp,
} from "../lib/zenith";
import { normalizeAddress } from "../lib/zenith";

const router: IRouter = Router();

router.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const params = GetLeaderboardQueryParams.parse(req.query);
    const top = await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.zp), usersTable.createdAt)
      .limit(100);

    const totalUsersRow = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(usersTable);
    const totalUsers = totalUsersRow[0]?.c ?? 0;

    const entries = top.map((u, idx) => {
      const { tier, multiplier } = tierForZp(u.zp);
      const as = computeActivityScore(u.txCount, u.uniqueContracts);
      const finalScore = computeFinalScore(
        u.zp,
        multiplier,
        u.reputationScore,
        as,
      );
      return {
        rank: idx + 1,
        walletAddress: u.walletAddress,
        zp: u.zp,
        tier,
        finalScore,
      };
    });

    let you: (typeof entries)[number] | null = null;
    if (params.address) {
      const addr = normalizeAddress(params.address);
      const inTop = entries.find((e) => e.walletAddress === addr);
      if (inTop) {
        you = inTop;
      } else {
        const rank = await db.execute(sql`
          SELECT * FROM (
            SELECT wallet_address, zp, reputation_score, tx_count, unique_contracts,
              ROW_NUMBER() OVER (ORDER BY zp DESC, created_at ASC) AS rnk
            FROM users
          ) t WHERE wallet_address = ${addr}
        `);
        const row = (rank.rows ?? rank)[0] as
          | {
              wallet_address: string;
              zp: number;
              reputation_score: number;
              tx_count: number;
              unique_contracts: number;
              rnk: number | string;
            }
          | undefined;
        if (row) {
          const { tier, multiplier } = tierForZp(row.zp);
          const asScore = computeActivityScore(
            row.tx_count,
            row.unique_contracts,
          );
          you = {
            rank: Number(row.rnk),
            walletAddress: row.wallet_address,
            zp: row.zp,
            tier,
            finalScore: computeFinalScore(
              row.zp,
              multiplier,
              row.reputation_score,
              asScore,
            ),
          };
        }
      }
    }

    res.json(
      GetLeaderboardResponse.parse({
        entries,
        you,
        totalUsers,
      }),
    );
  }),
);

export default router;
