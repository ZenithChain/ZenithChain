import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  faucetClaimsTable,
  activityLogsTable,
  missionsTable,
  userMissionsTable,
} from "@workspace/db/schema";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import {
  ClaimFaucetBody,
  ClaimFaucetResponse,
  GetFaucetStatusQueryParams,
  GetFaucetStatusResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  fetchUserByAddress,
  HttpError,
  requireValidAddress,
} from "../lib/userService";
import { bumpActivity } from "../lib/userService";
import {
  clientIp,
  fakeTxHash,
  FAUCET_AMOUNT,
  FAUCET_COOLDOWN_HOURS,
  FAUCET_IP_DAILY_LIMIT,
  nextWindowAt,
  secondsUntil,
} from "../lib/zenith";
import { rateLimit } from "../lib/rateLimit";

const router: IRouter = Router();

router.get(
  "/faucet/status",
  asyncHandler(async (req, res) => {
    const params = GetFaucetStatusQueryParams.parse(req.query);
    const addr = requireValidAddress(params.address);

    const lastClaim = await db
      .select()
      .from(faucetClaimsTable)
      .where(eq(faucetClaimsTable.walletAddress, addr))
      .orderBy(desc(faucetClaimsTable.claimedAt))
      .limit(1);

    if (lastClaim.length === 0) {
      res.json(
        GetFaucetStatusResponse.parse({
          canClaim: true,
          nextClaimAt: null,
          cooldownSecondsRemaining: 0,
          lastTxHash: null,
          amount: FAUCET_AMOUNT,
        }),
      );
      return;
    }

    const next = nextWindowAt(lastClaim[0]!.claimedAt, FAUCET_COOLDOWN_HOURS);
    const seconds = secondsUntil(next);
    res.json(
      GetFaucetStatusResponse.parse({
        canClaim: seconds === 0,
        nextClaimAt: next.toISOString(),
        cooldownSecondsRemaining: seconds,
        lastTxHash: lastClaim[0]!.txHash,
        amount: FAUCET_AMOUNT,
      }),
    );
  }),
);

router.post(
  "/faucet",
  rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "faucet" }),
  asyncHandler(async (req, res) => {
    const body = ClaimFaucetBody.parse(req.body);
    const addr = requireValidAddress(body.address);
    const ip = clientIp(req);

    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const lastClaim = await db
      .select()
      .from(faucetClaimsTable)
      .where(eq(faucetClaimsTable.walletAddress, addr))
      .orderBy(desc(faucetClaimsTable.claimedAt))
      .limit(1);

    if (lastClaim.length > 0) {
      const next = nextWindowAt(lastClaim[0]!.claimedAt, FAUCET_COOLDOWN_HOURS);
      const seconds = secondsUntil(next);
      if (seconds > 0) {
        throw new HttpError(429, "Faucet cooldown is still active.", {
          code: "COOLDOWN",
          retryAfterSeconds: seconds,
        });
      }
    }

    // IP rate limit (simple per-day window)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipClaims = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(faucetClaimsTable)
      .where(
        and(
          eq(faucetClaimsTable.ip, ip),
          gt(faucetClaimsTable.claimedAt, dayAgo),
        ),
      );
    if ((ipClaims[0]?.c ?? 0) >= FAUCET_IP_DAILY_LIMIT) {
      throw new HttpError(
        429,
        `Too many faucet claims from your network today (limit ${FAUCET_IP_DAILY_LIMIT}).`,
        { code: "IP_LIMIT", retryAfterSeconds: 60 * 60 },
      );
    }

    const txHash = fakeTxHash(addr);
    const now = new Date();
    await db.insert(faucetClaimsTable).values({
      walletAddress: addr,
      amount: FAUCET_AMOUNT,
      txHash,
      ip,
    });

    await db
      .update(usersTable)
      .set({ lastClaim: now, updatedAt: now })
      .where(eq(usersTable.walletAddress, addr));

    await db.insert(activityLogsTable).values({
      walletAddress: addr,
      action: "faucet_claim",
      detail: `+${FAUCET_AMOUNT} ZTH`,
      zpDelta: 0,
      ip,
    });

    await bumpActivity(addr, { txDelta: 1 });

    // Auto-mark "claim-faucet" mission complete if not already done.
    try {
      const claimMission = await db
        .select()
        .from(missionsTable)
        .where(eq(missionsTable.slug, "claim-faucet"))
        .limit(1);
      const m = claimMission[0];
      if (m) {
        const exists = await db
          .select()
          .from(userMissionsTable)
          .where(
            and(
              eq(userMissionsTable.walletAddress, addr),
              eq(userMissionsTable.missionId, m.id),
            ),
          )
          .limit(1);
        if (exists.length === 0) {
          await db
            .insert(userMissionsTable)
            .values({ walletAddress: addr, missionId: m.id })
            .onConflictDoNothing();
        }
      }
    } catch (e) {
      req.log.warn({ err: e }, "Failed to auto-complete claim-faucet mission");
    }

    res.json(
      ClaimFaucetResponse.parse({
        success: true,
        amount: FAUCET_AMOUNT,
        txHash,
        nextClaimAt: nextWindowAt(now, FAUCET_COOLDOWN_HOURS).toISOString(),
      }),
    );
  }),
);

export default router;
