import { db } from "@workspace/db";
import {
  usersTable,
  activityLogsTable,
  referralsTable,
  type UserRow,
} from "@workspace/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import {
  computeActivityScore,
  computeFinalScore,
  computeReputationScore,
  generateReferralCode,
  isValidEthAddress,
  normalizeAddress,
  tierForZp,
} from "./zenith";

export class HttpError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;
  constructor(
    status: number,
    message: string,
    opts: { code?: string; retryAfterSeconds?: number } = {},
  ) {
    super(message);
    this.status = status;
    this.code = opts.code;
    this.retryAfterSeconds = opts.retryAfterSeconds;
  }
}

export function requireValidAddress(address: unknown): string {
  if (!isValidEthAddress(address)) {
    throw new HttpError(400, "Invalid wallet address", { code: "BAD_ADDRESS" });
  }
  return normalizeAddress(address);
}

export async function getOrCreateUser(opts: {
  address: string;
  ip?: string;
  referralCode?: string | null;
}): Promise<{ user: UserRow; created: boolean }> {
  const addr = requireValidAddress(opts.address);
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, addr))
    .limit(1);

  if (existing.length > 0) {
    return { user: existing[0]!, created: false };
  }

  let invitedBy: string | null = null;
  if (opts.referralCode && opts.referralCode.trim().length > 0) {
    const code = opts.referralCode.trim().toUpperCase();
    const inviterArr = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.referralCode, code))
      .limit(1);
    const inviter = inviterArr[0];
    if (inviter && inviter.walletAddress !== addr) {
      invitedBy = inviter.walletAddress;
    }
  }

  let attempts = 0;
  let inserted: UserRow | null = null;
  while (!inserted && attempts < 5) {
    attempts += 1;
    const code = generateReferralCode(addr);
    try {
      const rows = await db
        .insert(usersTable)
        .values({
          walletAddress: addr,
          zp: 0,
          activityScore: 0,
          reputationScore: 1,
          txCount: 0,
          uniqueContracts: 0,
          streakCount: 0,
          referralCode: code,
          invitedBy,
        })
        .returning();
      inserted = rows[0]!;
    } catch (err) {
      // collision on referral code — retry
      if (attempts >= 5) throw err;
    }
  }

  if (!inserted) throw new Error("Failed to create user");

  await db.insert(activityLogsTable).values({
    walletAddress: addr,
    action: "wallet_connected",
    detail: invitedBy ? `Joined via ${invitedBy.slice(0, 10)}…` : null,
    zpDelta: 0,
    ip: opts.ip ?? null,
  });

  // Reward inviter & invitee
  if (invitedBy) {
    const INVITER_REWARD = 200;
    const INVITEE_REWARD = 100;
    await db.insert(referralsTable).values({
      inviter: invitedBy,
      invitee: addr,
      inviteeIp: opts.ip ?? null,
      zpAwardedToInviter: INVITER_REWARD,
    });
    await awardZp(invitedBy, INVITER_REWARD, "referral_bonus", `+${addr.slice(0, 10)}…`);
    await awardZp(addr, INVITEE_REWARD, "referral_signup", `Joined via referral`);
    const refreshed = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.walletAddress, addr))
      .limit(1);
    inserted = refreshed[0] ?? inserted;
  }

  return { user: inserted, created: true };
}

export async function awardZp(
  address: string,
  amount: number,
  action: string,
  detail?: string | null,
  ip?: string | null,
): Promise<UserRow> {
  const addr = normalizeAddress(address);
  const updated = await db
    .update(usersTable)
    .set({
      zp: sql`${usersTable.zp} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.walletAddress, addr))
    .returning();

  if (updated.length === 0) {
    throw new HttpError(404, "User not found");
  }

  await db.insert(activityLogsTable).values({
    walletAddress: addr,
    action,
    detail: detail ?? null,
    zpDelta: amount,
    ip: ip ?? null,
  });

  return updated[0]!;
}

export async function bumpActivity(
  address: string,
  opts: {
    txDelta?: number;
    contractDelta?: number;
  } = {},
): Promise<UserRow> {
  const addr = normalizeAddress(address);
  const updated = await db
    .update(usersTable)
    .set({
      txCount: sql`${usersTable.txCount} + ${opts.txDelta ?? 0}`,
      uniqueContracts: sql`${usersTable.uniqueContracts} + ${opts.contractDelta ?? 0}`,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.walletAddress, addr))
    .returning();
  return updated[0]!;
}

export async function getUserRank(address: string): Promise<number | null> {
  const addr = normalizeAddress(address);
  const rows = await db.execute(sql`
    SELECT rnk FROM (
      SELECT wallet_address, ROW_NUMBER() OVER (ORDER BY zp DESC, created_at ASC) AS rnk
      FROM users
    ) t WHERE wallet_address = ${addr}
  `);
  const first = (rows.rows ?? rows)[0] as { rnk?: number } | undefined;
  if (!first || typeof first.rnk !== "number") {
    // node-postgres returns numeric as string sometimes
    const v = first?.rnk;
    if (v !== undefined) return Number(v);
    return null;
  }
  return first.rnk;
}

export async function buildUserResponse(user: UserRow) {
  const { tier, multiplier } = tierForZp(user.zp);
  // Recompute AS based on current counters
  const as = computeActivityScore(user.txCount, user.uniqueContracts);
  // Recompute RS based on signals
  const ageDays =
    (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  const referralCount = (
    await db
      .select({ c: sql<number>`count(*)::int` })
      .from(referralsTable)
      .where(eq(referralsTable.inviter, user.walletAddress))
  )[0]?.c ?? 0;
  const ipRows = await db
    .select({ ip: activityLogsTable.ip })
    .from(activityLogsTable)
    .where(eq(activityLogsTable.walletAddress, user.walletAddress));
  const uniqueIps = new Set(
    ipRows.map((r) => r.ip).filter((ip): ip is string => !!ip),
  ).size;
  const rs = computeReputationScore({
    ageDays,
    txCount: user.txCount,
    uniqueIps,
    redeemedReferrals: referralCount,
  });
  const finalScore = computeFinalScore(user.zp, multiplier, rs, as);
  const rank = await getUserRank(user.walletAddress);

  return {
    walletAddress: user.walletAddress,
    zp: user.zp,
    as,
    rs,
    tier,
    tierMultiplier: multiplier,
    finalScore,
    streakCount: user.streakCount,
    lastCheckin: user.lastCheckin ? user.lastCheckin.toISOString() : null,
    lastClaim: user.lastClaim ? user.lastClaim.toISOString() : null,
    rank,
    referralCode: user.referralCode,
    invitedBy: user.invitedBy,
    createdAt: user.createdAt.toISOString(),
    txCount: user.txCount,
    uniqueContracts: user.uniqueContracts,
  };
}

export async function fetchUserByAddress(address: string): Promise<UserRow | null> {
  const addr = normalizeAddress(address);
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.walletAddress, addr))
    .limit(1);
  return rows[0] ?? null;
}

export async function fetchUserByReferralCode(
  code: string,
): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.referralCode, code.trim().toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

export { and, desc };
