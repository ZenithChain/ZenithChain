import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  boxOpeningsTable,
  activityLogsTable,
} from "@workspace/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import {
  ListBoxesResponse,
  OpenBoxBody,
  OpenBoxResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  awardZp,
  buildUserResponse,
  fetchUserByAddress,
  HttpError,
  requireValidAddress,
} from "../lib/userService";
import { BOX_CONFIG, rollBoxReward, clientIp } from "../lib/zenith";

const router: IRouter = Router();

router.get(
  "/boxes",
  asyncHandler(async (_req, res) => {
    const data = (Object.values(BOX_CONFIG) as Array<typeof BOX_CONFIG[keyof typeof BOX_CONFIG]>).map((b) => ({
      rarity: b.rarity,
      name: b.name,
      cost: b.cost,
      minReward: b.minReward,
      maxReward: b.maxReward,
      jackpot: b.jackpot,
      jackpotChance: b.jackpotChance,
      description: b.description,
      dailyLimit: b.dailyLimit,
    }));
    res.json(ListBoxesResponse.parse(data));
  }),
);

router.post(
  "/open-box",
  asyncHandler(async (req, res) => {
    const body = OpenBoxBody.parse(req.body);
    const addr = requireValidAddress(body.address);
    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const def = BOX_CONFIG[body.rarity];
    if (!def) throw new HttpError(400, "Unknown box rarity");

    if (user.zp < def.cost) {
      throw new HttpError(400, "Not enough ZP to open this box.", {
        code: "INSUFFICIENT_ZP",
      });
    }

    // Daily limit check
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const openedToday = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(boxOpeningsTable)
      .where(
        and(
          eq(boxOpeningsTable.walletAddress, addr),
          eq(boxOpeningsTable.rarity, body.rarity),
          gt(boxOpeningsTable.openedAt, dayAgo),
        ),
      );
    if ((openedToday[0]?.c ?? 0) >= def.dailyLimit) {
      throw new HttpError(
        429,
        `You have reached today's limit for ${def.name} (${def.dailyLimit}).`,
        { code: "DAILY_LIMIT", retryAfterSeconds: 60 * 60 },
      );
    }

    const roll = rollBoxReward(body.rarity);
    const net = roll.zp - def.cost;

    await db.insert(boxOpeningsTable).values({
      walletAddress: addr,
      rarity: body.rarity,
      cost: def.cost,
      zpReward: roll.zp,
      isJackpot: roll.isJackpot,
      bonus: roll.bonus,
    });

    await db.insert(activityLogsTable).values({
      walletAddress: addr,
      action: `box_${body.rarity}`,
      detail: roll.isJackpot
        ? `JACKPOT! +${roll.zp} ZP`
        : `${def.name} → +${roll.zp} ZP (cost ${def.cost})`,
      zpDelta: net,
      ip: clientIp(req),
    });

    const updated = await awardZp(
      addr,
      net,
      `box_open`,
      roll.bonus ?? `${def.name} reward`,
    );

    const response = await buildUserResponse(updated);
    res.json(
      OpenBoxResponse.parse({
        success: true,
        rarity: body.rarity,
        zpReward: roll.zp,
        bonus: roll.bonus,
        isJackpot: roll.isJackpot,
        user: response,
      }),
    );
  }),
);

export default router;
