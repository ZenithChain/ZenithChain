import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  missionsTable,
  userMissionsTable,
} from "@workspace/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  CompleteMissionBody,
  CompleteMissionResponse,
  ListMissionsQueryParams,
  ListMissionsResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  awardZp,
  buildUserResponse,
  fetchUserByAddress,
  HttpError,
  requireValidAddress,
} from "../lib/userService";
import { bumpActivity } from "../lib/userService";

const router: IRouter = Router();

router.get(
  "/missions",
  asyncHandler(async (req, res) => {
    const params = ListMissionsQueryParams.parse(req.query);
    const missions = await db
      .select()
      .from(missionsTable)
      .orderBy(asc(missionsTable.sortOrder), asc(missionsTable.id));

    let completedIds = new Set<number>();
    const completedMap = new Map<number, Date>();
    if (params.address) {
      const addr = requireValidAddress(params.address);
      const completed = await db
        .select()
        .from(userMissionsTable)
        .where(eq(userMissionsTable.walletAddress, addr));
      completedIds = new Set(completed.map((c) => c.missionId));
      for (const c of completed) {
        completedMap.set(c.missionId, c.completedAt);
      }
    }

    const data = missions.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      description: m.description,
      reward: m.reward,
      type: m.type as "basic" | "advanced" | "social",
      actionLabel: m.actionLabel,
      actionUrl: m.actionUrl,
      completed: completedIds.has(m.id),
      completedAt: completedMap.get(m.id)
        ? completedMap.get(m.id)!.toISOString()
        : null,
    }));
    res.json(ListMissionsResponse.parse(data));
  }),
);

router.post(
  "/complete-mission",
  asyncHandler(async (req, res) => {
    const body = CompleteMissionBody.parse(req.body);
    const addr = requireValidAddress(body.address);
    const user = await fetchUserByAddress(addr);
    if (!user) {
      throw new HttpError(404, "Connect your wallet first.");
    }

    const missionRows = await db
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.slug, body.missionSlug))
      .limit(1);
    const mission = missionRows[0];
    if (!mission) {
      throw new HttpError(404, "Mission not found");
    }

    const existing = await db
      .select()
      .from(userMissionsTable)
      .where(
        and(
          eq(userMissionsTable.walletAddress, addr),
          eq(userMissionsTable.missionId, mission.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new HttpError(400, "Mission already completed", {
        code: "ALREADY_COMPLETED",
      });
    }

    await db.insert(userMissionsTable).values({
      walletAddress: addr,
      missionId: mission.id,
    });

    // Advanced/onchain missions ALSO bump activity counters
    if (mission.type === "advanced") {
      await bumpActivity(addr, { txDelta: 1, contractDelta: 1 });
    } else if (mission.type === "basic") {
      await bumpActivity(addr, { txDelta: 1 });
    }

    const updatedUser = await awardZp(
      addr,
      mission.reward,
      `mission:${mission.slug}`,
      mission.name,
    );

    const response = await buildUserResponse(updatedUser);
    res.json(
      CompleteMissionResponse.parse({
        success: true,
        zpAwarded: mission.reward,
        user: response,
      }),
    );
  }),
);

export default router;
