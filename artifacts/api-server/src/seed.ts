import { db } from "@workspace/db";
import {
  missionsTable,
  usersTable,
  activityLogsTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "./lib/logger";

interface SeedMission {
  slug: string;
  name: string;
  description: string;
  reward: number;
  type: "basic" | "advanced" | "social";
  actionLabel?: string;
  actionUrl?: string;
  sortOrder: number;
}

const MISSIONS: SeedMission[] = [
  {
    slug: "connect-wallet",
    name: "Connect your wallet",
    description: "Link MetaMask or WalletConnect to begin your Zenith journey.",
    reward: 100,
    type: "basic",
    actionLabel: "Connect",
    sortOrder: 10,
  },
  {
    slug: "first-transaction",
    name: "Make your first transaction",
    description: "Send any ZTH transaction on Zenith Testnet.",
    reward: 200,
    type: "basic",
    actionLabel: "Open faucet",
    actionUrl: "/faucet",
    sortOrder: 20,
  },
  {
    slug: "claim-faucet",
    name: "Claim from the faucet",
    description: "Receive ZTH testnet tokens to power your missions.",
    reward: 150,
    type: "basic",
    actionLabel: "Claim",
    actionUrl: "/faucet",
    sortOrder: 30,
  },
  {
    slug: "smart-contract-interaction",
    name: "Interact with a smart contract",
    description: "Call any deployed Zenith contract method to earn ZP.",
    reward: 500,
    type: "advanced",
    actionLabel: "Verify",
    sortOrder: 40,
  },
  {
    slug: "swap",
    name: "Perform a token swap",
    description: "Use a Zenith DEX to swap any pair.",
    reward: 700,
    type: "advanced",
    actionLabel: "Verify swap",
    sortOrder: 50,
  },
  {
    slug: "staking",
    name: "Stake ZTH",
    description: "Stake any amount of ZTH on a Zenith validator.",
    reward: 1000,
    type: "advanced",
    actionLabel: "Verify stake",
    sortOrder: 60,
  },
  {
    slug: "follow-x",
    name: "Follow Zenith on X",
    description: "Follow @zenithchain on X to keep up with announcements.",
    reward: 80,
    type: "social",
    actionLabel: "Follow",
    actionUrl: "https://x.com/zenithchain",
    sortOrder: 70,
  },
  {
    slug: "join-telegram",
    name: "Join the Telegram",
    description: "Join the Zenith builders' Telegram community.",
    reward: 80,
    type: "social",
    actionLabel: "Join",
    actionUrl: "https://t.me/zenithchain",
    sortOrder: 80,
  },
  {
    slug: "join-discord",
    name: "Join the Discord",
    description: "Join the Zenith Discord and grab the Genesis role.",
    reward: 80,
    type: "social",
    actionLabel: "Join",
    actionUrl: "https://discord.gg/zenithchain",
    sortOrder: 90,
  },
  {
    slug: "invite-friend",
    name: "Invite a friend",
    description:
      "Share your referral link from the Referrals tab and have a friend join.",
    reward: 200,
    type: "social",
    actionLabel: "Get link",
    actionUrl: "/referrals",
    sortOrder: 100,
  },
];

const SAMPLE_USERS = [
  { addr: "0xa1b2c3d4e5f60718293a4b5c6d7e8f9012345678", zp: 24800, code: "GENESIS01" },
  { addr: "0x1234567890abcdef1234567890abcdef12345678", zp: 17350, code: "ZENITH02" },
  { addr: "0xc0ffee00deadbeefc0ffee00deadbeefc0ffee00", zp: 12100, code: "ZENITH03" },
  { addr: "0x9876543210fedcba9876543210fedcba98765432", zp: 8430, code: "ZENITH04" },
  { addr: "0xfacefeedfacefeedfacefeedfacefeedfaceface", zp: 6720, code: "ZENITH05" },
  { addr: "0x0a0b0c0d0e0f1011121314151617181920212223", zp: 4900, code: "ZENITH06" },
  { addr: "0x4f4e4d4c4b4a49484746454443424140ffeeddcc", zp: 3580, code: "ZENITH07" },
  { addr: "0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0", zp: 2120, code: "ZENITH08" },
  { addr: "0xababababababababababababababababababab10", zp: 1340, code: "ZENITH09" },
  { addr: "0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd11", zp: 720, code: "ZENITH10" },
];

export async function seedZenith(): Promise<void> {
  for (const m of MISSIONS) {
    const existing = await db
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.slug, m.slug))
      .limit(1);
    if (existing[0]) {
      await db
        .update(missionsTable)
        .set({
          name: m.name,
          description: m.description,
          reward: m.reward,
          type: m.type,
          actionLabel: m.actionLabel ?? null,
          actionUrl: m.actionUrl ?? null,
          sortOrder: m.sortOrder,
        })
        .where(eq(missionsTable.slug, m.slug));
    } else {
      await db.insert(missionsTable).values({
        slug: m.slug,
        name: m.name,
        description: m.description,
        reward: m.reward,
        type: m.type,
        actionLabel: m.actionLabel ?? null,
        actionUrl: m.actionUrl ?? null,
        sortOrder: m.sortOrder,
      });
    }
  }

  const userCount = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(usersTable);

  if ((userCount[0]?.c ?? 0) === 0) {
    for (const u of SAMPLE_USERS) {
      const txCount = Math.max(5, Math.round(u.zp / 80));
      const uniqueContracts = Math.max(2, Math.round(u.zp / 800));
      await db.insert(usersTable).values({
        walletAddress: u.addr,
        zp: u.zp,
        activityScore: 0,
        reputationScore: 1.2,
        txCount,
        uniqueContracts,
        streakCount: Math.min(7, Math.round(u.zp / 4000) + 1),
        referralCode: u.code,
      });
      await db.insert(activityLogsTable).values({
        walletAddress: u.addr,
        action: "wallet_connected",
        detail: "Genesis cohort",
        zpDelta: 0,
      });
    }
    logger.info({ count: SAMPLE_USERS.length }, "Seeded sample users");
  }
  logger.info({ missions: MISSIONS.length }, "Missions seeded/synced");
}
