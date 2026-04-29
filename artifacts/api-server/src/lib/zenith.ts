import { randomBytes, createHash } from "crypto";

export type Tier = "bronze" | "silver" | "gold" | "elite";
export type BoxRarity = "basic" | "rare" | "epic";

export const ZENITH_NETWORK = {
  chainId: "0x17605",
  chainIdDec: 95749,
  chainName: "Zenith Testnet",
  rpcUrl: "https://rpc.zerithchain.xyz",
  blockExplorerUrl: "https://explorer.zerithchain.xyz",
  currencySymbol: "ZTH",
  currencyName: "Zenith",
  decimals: 18,
  totalSupply: "1000000000",
} as const;

export const FAUCET_AMOUNT = Number(process.env.FAUCET_AMOUNT ?? 1);
export const FAUCET_COOLDOWN_HOURS = Number(process.env.FAUCET_COOLDOWN_HOURS ?? 5);
export const FAUCET_IP_DAILY_LIMIT = 5;
export const CHECKIN_COOLDOWN_HOURS = 24;

export const TIER_THRESHOLDS: { tier: Tier; min: number; multiplier: number }[] = [
  { tier: "bronze", min: 0, multiplier: 1 },
  { tier: "silver", min: 1000, multiplier: 1.25 },
  { tier: "gold", min: 5000, multiplier: 1.5 },
  { tier: "elite", min: 20000, multiplier: 2 },
];

export function tierForZp(zp: number): { tier: Tier; multiplier: number } {
  let chosen = TIER_THRESHOLDS[0]!;
  for (const t of TIER_THRESHOLDS) {
    if (zp >= t.min) chosen = t;
  }
  return { tier: chosen.tier, multiplier: chosen.multiplier };
}

export function computeFinalScore(
  zp: number,
  tierMultiplier: number,
  rs: number,
  as: number,
): number {
  // final_score = ZP × tier_multiplier × RS × AS — but AS can be 0; keep at least 1 to avoid wiping ZP weight
  const asEff = Math.max(1, as);
  return Number((zp * tierMultiplier * rs * asEff).toFixed(2));
}

export function computeActivityScore(
  txCount: number,
  uniqueContracts: number,
): number {
  const TX_WEIGHT = 1;
  const CONTRACT_BONUS = 5;
  const raw = txCount * TX_WEIGHT + uniqueContracts * CONTRACT_BONUS;
  return Number(raw.toFixed(2));
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function generateReferralCode(seed: string): string {
  const hash = createHash("sha1")
    .update(`${seed}:${Date.now()}:${randomBytes(4).toString("hex")}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return hash;
}

export function isValidEthAddress(address: unknown): address is string {
  return (
    typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address)
  );
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function shortAddr(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function fakeTxHash(seed: string): string {
  const h = createHash("sha256")
    .update(`${seed}:${Date.now()}:${randomBytes(8).toString("hex")}`)
    .digest("hex");
  return `0x${h}`;
}

export function nextWindowAt(from: Date, hours: number): Date {
  return new Date(from.getTime() + hours * HOUR_MS);
}

export function secondsUntil(date: Date | null | undefined): number {
  if (!date) return 0;
  const diff = Math.ceil((date.getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
}

// ---- Daily check-in ----
export const CHECKIN_BASE = 50;
export const CHECKIN_INCREMENT = 10;
export const CHECKIN_BONUS_DAY = 7;
export const CHECKIN_BONUS = 300;

export function rewardForCheckinDay(day: number): {
  base: number;
  bonus: number;
} {
  const base = CHECKIN_BASE + (day - 1) * CHECKIN_INCREMENT;
  const bonus = day === CHECKIN_BONUS_DAY ? CHECKIN_BONUS : 0;
  return { base, bonus };
}

export function nextStreakDay(
  lastCheckin: Date | null,
  currentStreak: number,
  now: Date = new Date(),
): { newStreakDay: number; isNewDay: boolean; isReset: boolean } {
  if (!lastCheckin) {
    return { newStreakDay: 1, isNewDay: true, isReset: false };
  }
  const sinceMs = now.getTime() - lastCheckin.getTime();
  if (sinceMs < CHECKIN_COOLDOWN_HOURS * HOUR_MS) {
    return { newStreakDay: currentStreak, isNewDay: false, isReset: false };
  }
  if (sinceMs > 2 * DAY_MS) {
    // Missed more than a day — reset streak
    return { newStreakDay: 1, isNewDay: true, isReset: true };
  }
  // After 7 days, the cycle restarts
  const next = currentStreak >= 7 ? 1 : currentStreak + 1;
  return { newStreakDay: next, isNewDay: true, isReset: false };
}

// ---- Mystery boxes ----
export interface BoxDef {
  rarity: BoxRarity;
  name: string;
  cost: number;
  minReward: number;
  maxReward: number;
  jackpot: number;
  jackpotChance: number;
  description: string;
  dailyLimit: number;
  bonus?: string;
}

export const BOX_CONFIG: Record<BoxRarity, BoxDef> = {
  basic: {
    rarity: "basic",
    name: "Basic Box",
    cost: 200,
    minReward: 100,
    maxReward: 400,
    jackpot: 800,
    jackpotChance: 0.02,
    description:
      "An entry-level cache. Reliable returns and a small Activity boost.",
    dailyLimit: 10,
    bonus: "AS +0.05",
  },
  rare: {
    rarity: "rare",
    name: "Rare Box",
    cost: 1000,
    minReward: 500,
    maxReward: 2000,
    jackpot: 4000,
    jackpotChance: 0.03,
    description:
      "Higher stakes. Carries a medium multiplier boost on top of ZP.",
    dailyLimit: 5,
    bonus: "AS +0.15",
  },
  epic: {
    rarity: "epic",
    name: "Epic Box",
    cost: 5000,
    minReward: 2000,
    maxReward: 10000,
    jackpot: 25000,
    jackpotChance: 0.05,
    description:
      "Reserved for the most active. Chance at the rare jackpot reward.",
    dailyLimit: 2,
    bonus: "AS +0.5",
  },
};

export function rollBoxReward(rarity: BoxRarity): {
  zp: number;
  isJackpot: boolean;
  bonus: string | null;
} {
  const def = BOX_CONFIG[rarity];
  const jackpot = Math.random() < def.jackpotChance;
  const zp = jackpot
    ? def.jackpot
    : Math.floor(
        def.minReward + Math.random() * (def.maxReward - def.minReward + 1),
      );
  return { zp, isJackpot: jackpot, bonus: def.bonus ?? null };
}

// ---- Reputation Score ----
// Walls of behavioral signals are summarized into 0.1–1.5
export function computeReputationScore(opts: {
  ageDays: number;
  txCount: number;
  uniqueIps: number;
  redeemedReferrals: number;
}): number {
  let rs = 1.0;
  // Wallet age boost up to +0.3
  rs += Math.min(0.3, opts.ageDays / 60);
  // On-chain activity boost up to +0.2
  rs += Math.min(0.2, opts.txCount / 200);
  // IP diversity penalty: if more than 3 IPs, reduce
  if (opts.uniqueIps > 3) rs -= 0.15;
  // Heavy referral self-redeem penalty (anti-sybil heuristic)
  if (opts.redeemedReferrals > 25) rs -= 0.1;
  return Math.max(0.1, Math.min(1.5, Number(rs.toFixed(2))));
}

export function clientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0]!.trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0]!.split(",")[0]!.trim();
  }
  return req.ip ?? "unknown";
}
