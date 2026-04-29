import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  badgeClaimsTable,
  usersTable,
  referralsTable,
} from "@workspace/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler } from "../lib/errors";
import {
  awardZp,
  buildUserResponse,
  fetchUserByAddress,
  HttpError,
  requireValidAddress,
} from "../lib/userService";

const router: IRouter = Router();

const PIONEER_CAP = 1000;
const GENESIS_CAP = 10000;
const PIONEER_REFERRAL_REQUIREMENT = 10;

const PIONEER_REWARD_ZP = 5000;
const GENESIS_REWARD_ZP = 1000;

const BadgeType = z.enum(["pioneer", "genesis"]);
type BadgeType = z.infer<typeof BadgeType>;

const ClaimBody = z.object({
  address: z.string(),
  badgeType: BadgeType,
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chainId: z.number().int().optional(),
});

const EligibilityQuery = z.object({
  address: z.string().optional(),
});

async function countClaims(badgeType: BadgeType): Promise<number> {
  const r = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(badgeClaimsTable)
    .where(eq(badgeClaimsTable.badgeType, badgeType));
  return r[0]?.c ?? 0;
}

async function existingClaim(addr: string, badgeType: BadgeType) {
  const rows = await db
    .select()
    .from(badgeClaimsTable)
    .where(
      and(
        eq(badgeClaimsTable.walletAddress, addr),
        eq(badgeClaimsTable.badgeType, badgeType),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function countReferrals(addr: string): Promise<number> {
  const r = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(referralsTable)
    .where(eq(referralsTable.inviter, addr));
  return r[0]?.c ?? 0;
}

router.get(
  "/badges/eligibility",
  asyncHandler(async (req, res) => {
    const params = EligibilityQuery.parse(req.query);

    const pioneerClaimed = await countClaims("pioneer");
    const genesisClaimed = await countClaims("genesis");

    const result: any = {
      pioneer: {
        cap: PIONEER_CAP,
        claimed: pioneerClaimed,
        remaining: Math.max(0, PIONEER_CAP - pioneerClaimed),
        rewardZp: PIONEER_REWARD_ZP,
        referralRequirement: PIONEER_REFERRAL_REQUIREMENT,
      },
      genesis: {
        cap: GENESIS_CAP,
        claimed: genesisClaimed,
        remaining: Math.max(0, GENESIS_CAP - genesisClaimed),
        rewardZp: GENESIS_REWARD_ZP,
      },
    };

    if (params.address) {
      const addr = requireValidAddress(params.address);
      const user = await fetchUserByAddress(addr);
      const referrals = await countReferrals(addr);
      const pioneerExisting = await existingClaim(addr, "pioneer");
      const genesisExisting = await existingClaim(addr, "genesis");

      result.user = {
        connected: !!user,
        referrals,
        pioneer: {
          claimed: !!pioneerExisting,
          eligible:
            !!user &&
            !pioneerExisting &&
            pioneerClaimed < PIONEER_CAP &&
            referrals >= PIONEER_REFERRAL_REQUIREMENT,
          claim: pioneerExisting
            ? {
                txHash: pioneerExisting.txHash,
                position: pioneerExisting.position,
                claimedAt: pioneerExisting.claimedAt.toISOString(),
              }
            : null,
          unmetReason: !user
            ? "Connect your wallet first."
            : pioneerExisting
              ? null
              : pioneerClaimed >= PIONEER_CAP
                ? `Sold out — only ${PIONEER_CAP} Pioneer badges available.`
                : referrals < PIONEER_REFERRAL_REQUIREMENT
                  ? `You need ${PIONEER_REFERRAL_REQUIREMENT} referrals (you have ${referrals}).`
                  : null,
        },
        genesis: {
          claimed: !!genesisExisting,
          eligible:
            !!user && !genesisExisting && genesisClaimed < GENESIS_CAP,
          claim: genesisExisting
            ? {
                txHash: genesisExisting.txHash,
                position: genesisExisting.position,
                claimedAt: genesisExisting.claimedAt.toISOString(),
              }
            : null,
          unmetReason: !user
            ? "Connect your wallet first."
            : genesisExisting
              ? null
              : genesisClaimed >= GENESIS_CAP
                ? `Sold out — only ${GENESIS_CAP} Genesis badges available.`
                : null,
        },
      };
    }

    res.json(result);
  }),
);

router.post(
  "/badges/claim",
  asyncHandler(async (req, res) => {
    const body = ClaimBody.parse(req.body);
    const addr = requireValidAddress(body.address);

    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const existing = await existingClaim(addr, body.badgeType);
    if (existing) {
      throw new HttpError(400, "Badge already claimed.", {
        code: "ALREADY_CLAIMED",
      });
    }

    if (body.badgeType === "pioneer") {
      const refs = await countReferrals(addr);
      if (refs < PIONEER_REFERRAL_REQUIREMENT) {
        throw new HttpError(
          403,
          `You need ${PIONEER_REFERRAL_REQUIREMENT} referrals to mint Pioneer (you have ${refs}).`,
          { code: "INELIGIBLE" },
        );
      }
    }

    const cap = body.badgeType === "pioneer" ? PIONEER_CAP : GENESIS_CAP;
    const claimed = await countClaims(body.badgeType);
    if (claimed >= cap) {
      throw new HttpError(
        410,
        `Badge sold out — all ${cap} ${body.badgeType} badges have been minted.`,
        { code: "SOLD_OUT" },
      );
    }

    const position = claimed + 1;

    try {
      await db.insert(badgeClaimsTable).values({
        walletAddress: addr,
        badgeType: body.badgeType,
        txHash: body.txHash,
        chainId: body.chainId ?? null,
        position,
      });
    } catch (e: any) {
      if (e?.code === "23505") {
        throw new HttpError(400, "Badge already claimed.", {
          code: "ALREADY_CLAIMED",
        });
      }
      throw e;
    }

    const reward =
      body.badgeType === "pioneer" ? PIONEER_REWARD_ZP : GENESIS_REWARD_ZP;
    const updatedUser = await awardZp(
      addr,
      reward,
      `badge:${body.badgeType}`,
      `Minted Zenith ${body.badgeType[0]?.toUpperCase()}${body.badgeType.slice(1)} badge #${position}`,
    );

    res.json({
      success: true,
      badgeType: body.badgeType,
      position,
      txHash: body.txHash,
      zpAwarded: reward,
      user: await buildUserResponse(updatedUser),
    });
  }),
);

router.get(
  "/badges/holders",
  asyncHandler(async (req, res) => {
    const params = z
      .object({
        badgeType: BadgeType,
        limit: z.coerce.number().int().min(1).max(100).default(20),
      })
      .parse(req.query);

    const rows = await db
      .select()
      .from(badgeClaimsTable)
      .where(eq(badgeClaimsTable.badgeType, params.badgeType))
      .orderBy(asc(badgeClaimsTable.position))
      .limit(params.limit);

    res.json(
      rows.map((r) => ({
        walletAddress: r.walletAddress,
        position: r.position,
        txHash: r.txHash,
        claimedAt: r.claimedAt.toISOString(),
      })),
    );
  }),
);

export default router;
