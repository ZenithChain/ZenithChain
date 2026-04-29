import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { featureFlagsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  FeatureFlag,
  FeatureFlagsResponse,
  AdminCheckResponse,
  SetFeatureFlagRequest,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import { HttpError } from "../lib/userService";
import {
  FEATURE_PAGES,
  FEATURE_KEYS,
  isAdminAddress,
  isAdminConfigured,
  getAdminAddressFromRequest,
} from "../lib/adminAuth";

const router: IRouter = Router();

router.get(
  "/feature-flags",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(featureFlagsTable);
    const map = new Map(rows.map((r) => [r.pageKey, r]));

    const flags = FEATURE_PAGES.map((p) => {
      const row = map.get(p.key);
      return FeatureFlag.parse({
        key: p.key,
        label: p.label,
        description: p.description,
        enabled: row ? row.enabled : true,
        updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
        updatedBy: row?.updatedBy ?? null,
      });
    });

    res.json(FeatureFlagsResponse.parse({ flags }));
  }),
);

router.get(
  "/admin/check",
  asyncHandler(async (req, res) => {
    const addr = typeof req.query.address === "string" ? req.query.address : "";
    res.json(
      AdminCheckResponse.parse({
        isAdmin: isAdminAddress(addr),
        configured: isAdminConfigured(),
      }),
    );
  }),
);

router.post(
  "/admin/feature-flags",
  asyncHandler(async (req, res) => {
    const adminAddr = getAdminAddressFromRequest(req);
    if (!isAdminAddress(adminAddr)) {
      throw new HttpError(401, "Unauthorized: connect with an admin wallet.");
    }

    const body = SetFeatureFlagRequest.parse(req.body);
    if (!FEATURE_KEYS.includes(body.key)) {
      throw new HttpError(400, `Unknown page key: ${body.key}`);
    }

    const meta = FEATURE_PAGES.find((p) => p.key === body.key)!;

    const existing = await db
      .select()
      .from(featureFlagsTable)
      .where(eq(featureFlagsTable.pageKey, body.key))
      .limit(1);

    let row;
    if (existing.length === 0) {
      [row] = await db
        .insert(featureFlagsTable)
        .values({
          pageKey: body.key,
          enabled: body.enabled,
          updatedBy: adminAddr!.toLowerCase(),
        })
        .returning();
    } else {
      [row] = await db
        .update(featureFlagsTable)
        .set({
          enabled: body.enabled,
          updatedAt: new Date(),
          updatedBy: adminAddr!.toLowerCase(),
        })
        .where(eq(featureFlagsTable.pageKey, body.key))
        .returning();
    }

    res.json(
      FeatureFlag.parse({
        key: row.pageKey,
        label: meta.label,
        description: meta.description,
        enabled: row.enabled,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy ?? null,
      }),
    );
  }),
);

export default router;
