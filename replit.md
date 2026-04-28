# Workspace — ZENITH Genesis Campaign

## Overview

pnpm workspace monorepo hosting the ZENITH Web3 testnet campaign platform —
a production-grade Mission Control for the Zenith Testnet. Users connect a
wallet, complete missions, claim faucet drips, build a daily check-in streak,
open mystery boxes, climb a leaderboard, and refer friends.

## Artifacts

- `artifacts/api-server` (`@workspace/api-server`) — Express 5 API serving
  every Zenith feature (missions, faucet, check-in, boxes, leaderboard,
  referrals, activity feed, simulated explorer).
- `artifacts/zenith` (`@workspace/zenith`) — React + Vite frontend at `/`.
  Pages: Landing, Dashboard, Missions, Faucet, Check-in, Boxes, Leaderboard,
  Explorer, Referrals.
- `artifacts/mockup-sandbox` — design exploration sandbox (not used at runtime).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **Frontend**: React 18 + Vite + TanStack Query + wouter + Framer Motion +
  Tailwind + shadcn/Radix UI
- **Wallet**: wagmi + viem + WalletConnect (chain id `0x201` / 513)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Build**: esbuild for the API; Vite for the web app
- **Theme**: deep electric blue (#0007B9) on dark/light surfaces

## Domain logic

- **Tier multipliers**: bronze 1× (0–999 ZP), silver 1.25× (1k–4.9k),
  gold 1.5× (5k–19.9k), elite 2× (20k+).
- **Final score** = `ZP × tier_multiplier × RS × max(1, AS)`.
- **Reputation Score (RS)**: 0.1–1.5 — wallet age, on-chain tx count, IP
  diversity, and referral patterns.
- **Activity Score (AS)**: tx count + 5× unique contracts.
- **Faucet**: 7 ZTH per claim, 24h per-wallet cooldown, 5 claims/day per IP,
  60s burst rate-limit. Returns a deterministic mock tx hash.
- **Daily check-in**: day1 50 ZP, +10 per day, day 7 +300 bonus. Streak resets
  if a day is missed; cycle restarts at day 8.
- **Mystery boxes**: basic (200 ZP cost, 100–400 reward, jackpot 800 @2%, daily
  10), rare (1000/500–2000/4000 @3%/5), epic (5000/2000–10000/25000 @5%/2).
- **Referrals**: inviter +200 ZP, invitee +100 ZP, one redemption per wallet.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and
  Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/zenith run dev` — run web app locally

The API auto-seeds 10 missions and 10 sample leaderboard users on startup if
the database is empty (`artifacts/api-server/src/seed.ts`).

## Optional environment variables

- `VITE_WALLETCONNECT_PROJECT_ID` — enables WalletConnect modal in the web
  app. If absent, only the injected (MetaMask) connector is available.
- `FAUCET_AMOUNT` — override the default 7 ZTH faucet drip.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and
package details.
