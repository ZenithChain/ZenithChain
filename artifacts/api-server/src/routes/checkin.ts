import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  checkinsTable,
  activityLogsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  DailyCheckinBody,
  DailyCheckinResponse,
  GetCheckinStatusQueryParams,
  GetCheckinStatusResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  awardZp,
  buildUserResponse,
  fetchUserByAddress,
  HttpError,
  requireValidAddress,
} from "../lib/userService";
import {
  CHECKIN_COOLDOWN_HOURS,
  nextStreakDay,
  nextWindowAt,
  rewardForCheckinDay,
  secondsUntil,
  clientIp,
} from "../lib/zenith";

const router: IRouter = Router();

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];

router.get(
  "/checkin/status",
  asyncHandler(async (req, res) => {
    const params = GetCheckinStatusQueryParams.parse(req.query);
    const addr = requireValidAddress(params.address);
    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const streak = user.streakCount;
    const last = user.lastCheckin;
    const next = last ? nextWindowAt(last, CHECKIN_COOLDOWN_HOURS) : null;
    const seconds = next ? secondsUntil(next) : 0;
    const canCheckin = seconds === 0;

    // Determine which "day of the week" the user is on within the 7-day cycle.
    // streakCount represents days completed in the current cycle.
    const todayIndex = canCheckin
      ? Math.min(7, streak === 7 ? 1 : streak + 1)
      : Math.max(1, streak); // Display today's slot as the most recently completed

    const days = DAY_LABELS.map((label, idx) => {
      const day = idx + 1;
      const reward = rewardForCheckinDay(day);
      return {
        day,
        label,
        reward: reward.base + reward.bonus,
        completed: day <= streak,
        isToday: day === todayIndex,
        isBonus: day === 7,
      };
    });

    res.json(
      GetCheckinStatusResponse.parse({
        streakCount: streak,
        canCheckin,
        nextCheckinAt: next ? next.toISOString() : null,
        cooldownSecondsRemaining: seconds,
        days,
      }),
    );
  }),
);

router.post(
  "/checkin",
  asyncHandler(async (req, res) => {
    const body = DailyCheckinBody.parse(req.body);
    const addr = requireValidAddress(body.address);
    const ip = clientIp(req);
    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const now = new Date();
    const next = nextStreakDay(user.lastCheckin, user.streakCount, now);
    if (!next.isNewDay) {
      const cooldownTo = nextWindowAt(user.lastCheckin!, CHECKIN_COOLDOWN_HOURS);
      throw new HttpError(429, "Already checked in today.", {
        code: "ALREADY_CHECKED_IN",
        retryAfterSeconds: secondsUntil(cooldownTo),
      });
    }

    const reward = rewardForCheckinDay(next.newStreakDay);
    await db.insert(checkinsTable).values({
      walletAddress: addr,
      dayOfStreak: next.newStreakDay,
      zpAwarded: reward.base,
      bonusAwarded: reward.bonus,
    });

    await db
      .update(usersTable)
      .set({
        streakCount: next.newStreakDay,
        lastCheckin: now,
        updatedAt: now,
      })
      .where(eq(usersTable.walletAddress, addr));

    await db.insert(activityLogsTable).values({
      walletAddress: addr,
      action: "daily_checkin",
      detail: `Day ${next.newStreakDay}${reward.bonus ? " + bonus" : ""}`,
      zpDelta: reward.base + reward.bonus,
      ip,
    });

    const updated = await awardZp(
      addr,
      reward.base + reward.bonus,
      `checkin_award`,
      next.isReset ? "Streak reset → restarted" : null,
    );

    const response = await buildUserResponse(updated);
    res.json(
      DailyCheckinResponse.parse({
        success: true,
        dayOfStreak: next.newStreakDay,
        zpAwarded: reward.base,
        bonusAwarded: reward.bonus,
        nextCheckinAt: nextWindowAt(now, CHECKIN_COOLDOWN_HOURS).toISOString(),
        user: response,
      }),
    );
  }),
);

export default router;
