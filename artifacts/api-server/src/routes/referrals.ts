import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { referralsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  GetReferralInfoParams,
  GetReferralInfoResponse,
  RedeemReferralBody,
  RedeemReferralResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  awardZp,
  fetchUserByAddress,
  fetchUserByReferralCode,
  HttpError,
  requireValidAddress,
} from "../lib/userService";
import { clientIp } from "../lib/zenith";

const router: IRouter = Router();

router.get(
  "/referrals/:address",
  asyncHandler(async (req, res) => {
    const params = GetReferralInfoParams.parse(req.params);
    const addr = requireValidAddress(params.address);
    const user = await fetchUserByAddress(addr);
    if (!user) throw new HttpError(404, "User not found");

    const invitees = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.inviter, addr))
      .orderBy(desc(referralsTable.createdAt));

    const totalZp = invitees.reduce(
      (acc, r) => acc + r.zpAwardedToInviter,
      0,
    );

    res.json(
      GetReferralInfoResponse.parse({
        referralCode: user.referralCode,
        referralLink: `${req.protocol}://${req.get("host") ?? "zenith"}/?ref=${user.referralCode}`,
        invitees: invitees.map((r) => ({
          invitee: r.invitee,
          joinedAt: r.createdAt.toISOString(),
          zpEarned: r.zpAwardedToInviter,
        })),
        totalInvited: invitees.length,
        totalZpEarned: totalZp,
      }),
    );
  }),
);

router.post(
  "/referrals/redeem",
  asyncHandler(async (req, res) => {
    const body = RedeemReferralBody.parse(req.body);
    const addr = requireValidAddress(body.address);
    const ip = clientIp(req);
    const user = await fetchUserByAddress(addr);
    if (!user) throw new HttpError(404, "Connect your wallet first.");
    if (user.invitedBy) {
      throw new HttpError(400, "Referral already applied to this wallet.", {
        code: "ALREADY_REFERRED",
      });
    }
    const inviter = await fetchUserByReferralCode(body.referralCode);
    if (!inviter || inviter.walletAddress === addr) {
      throw new HttpError(400, "Invalid referral code.", {
        code: "BAD_CODE",
      });
    }

    const INVITER_REWARD = 200;
    const INVITEE_REWARD = 100;

    await db.insert(referralsTable).values({
      inviter: inviter.walletAddress,
      invitee: addr,
      inviteeIp: ip,
      zpAwardedToInviter: INVITER_REWARD,
    });

    await awardZp(
      inviter.walletAddress,
      INVITER_REWARD,
      "referral_bonus",
      `+${addr.slice(0, 10)}…`,
    );
    await awardZp(addr, INVITEE_REWARD, "referral_signup", "Referral applied", ip);

    res.json(
      RedeemReferralResponse.parse({
        success: true,
        inviter: inviter.walletAddress,
        zpAwarded: INVITEE_REWARD,
      }),
    );
  }),
);

export default router;
