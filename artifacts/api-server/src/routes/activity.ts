import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  GetActivityFeedParams,
  GetActivityFeedQueryParams,
  GetActivityFeedResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import { requireValidAddress } from "../lib/userService";

const router: IRouter = Router();

router.get(
  "/activity/:address",
  asyncHandler(async (req, res) => {
    const params = GetActivityFeedParams.parse(req.params);
    const query = GetActivityFeedQueryParams.parse(req.query);
    const addr = requireValidAddress(params.address);

    const limit = query.limit ?? 20;
    const rows = await db
      .select()
      .from(activityLogsTable)
      .where(eq(activityLogsTable.walletAddress, addr))
      .orderBy(desc(activityLogsTable.timestamp))
      .limit(limit);

    res.json(
      GetActivityFeedResponse.parse(
        rows.map((r) => ({
          id: r.id,
          action: r.action,
          detail: r.detail,
          zpDelta: r.zpDelta,
          timestamp: r.timestamp.toISOString(),
        })),
      ),
    );
  }),
);

export default router;
