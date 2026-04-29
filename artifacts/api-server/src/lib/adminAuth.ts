import type { Request } from "express";

export const FEATURE_PAGES = [
  {
    key: "missions",
    label: "Missions",
    description: "Onchain mission list and submissions.",
  },
  {
    key: "badges",
    label: "Badges",
    description: "Badge gallery and progress tracking.",
  },
  {
    key: "faucet",
    label: "Faucet",
    description: "Daily ZTH faucet claims.",
  },
  {
    key: "checkin",
    label: "Daily Check-in",
    description: "Daily check-in streaks and rewards.",
  },
  {
    key: "boxes",
    label: "Mystery Boxes",
    description: "Reward box opening with ZP.",
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    description: "Public ZP leaderboard rankings.",
  },
  {
    key: "referrals",
    label: "Referrals",
    description: "Referral program and invite codes.",
  },
  {
    key: "explorer",
    label: "Internal Explorer",
    description: "In-app blockchain explorer view.",
  },
] as const;

export type FeaturePageKey = (typeof FEATURE_PAGES)[number]["key"];

export const FEATURE_KEYS = FEATURE_PAGES.map((p) => p.key) as string[];

export function getAdminWallets(): string[] {
  const raw = process.env.ADMIN_WALLETS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  const list = getAdminWallets();
  if (list.length === 0) return false;
  return list.includes(address.toLowerCase());
}

export function isAdminConfigured(): boolean {
  return getAdminWallets().length > 0;
}

export function getAdminAddressFromRequest(req: Request): string | null {
  const raw = req.header("x-admin-address");
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
