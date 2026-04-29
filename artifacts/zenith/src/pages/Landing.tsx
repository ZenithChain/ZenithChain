import { Layout } from "@/components/Layout";
import { useGetGlobalStats } from "@workspace/api-client-react";
import { useAccount } from "wagmi";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Mascot } from "@/components/Mascot";
import {
  Target,
  Package,
  ShieldCheck,
  Zap,
  Trophy,
  Droplet,
  ArrowRight,
  CalendarCheck,
  Users,
  Award,
} from "lucide-react";
import badgePioneer from "@/assets/badge-pioneer.png";
import badgeGenesis from "@/assets/badge-genesis.png";

export default function Landing() {
  const { isConnected } = useAccount();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isConnected) setLocation("/dashboard");
  }, [isConnected, setLocation]);

  const { data: stats } = useGetGlobalStats();

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <Layout>
      {/* Hero — dark cinematic with eagle below headline */}
      <section className="relative overflow-hidden">
        {/* Dark cinematic background */}
        <div className="absolute inset-0 -z-10 hero-dark-bg" />
        {/* Star/spark layer */}
        <div className="absolute inset-0 -z-10 stars-layer pointer-events-none" />
        {/* Glow accents */}
        <div className="absolute -z-10 top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
        <div className="absolute -z-10 top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="container relative mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-white leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              Soar above
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-amber-200">
                the testnet.
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
              Complete onchain missions, claim ZTH, mint exclusive Genesis badges,
              and lock in your place in the Zenith Cohort.
            </p>

            {/* Eagle mascot below headline */}
            <div className="mt-10 flex justify-center">
              <Mascot size="xl" className="animate-float drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ConnectWalletButton />
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1.5 group"
              >
                How it works
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Smooth bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </section>

      {/* Live stats strip */}
      {stats && (
        <section className="container mx-auto px-4 md:px-6 -mt-4 relative z-10 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-2xl">
            {[
              { label: "Active Wallets", value: formatNumber(stats.totalUsers), icon: Users },
              { label: "Transactions", value: formatNumber(stats.totalTransactions), icon: Zap },
              { label: "Missions Done", value: formatNumber(stats.totalMissionsCompleted), icon: Target },
              { label: "ZP Awarded", value: formatNumber(stats.totalZpAwarded), icon: Trophy },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 px-2 md:px-4 py-2 border-r border-border last:border-r-0 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide font-medium truncate">
                      {s.label}
                    </div>
                    <div className="text-lg md:text-2xl font-bold tabular-nums">
                      {s.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Badges showcase */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Onchain Badges
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Mint a soulbound place in history
          </h2>
          <p className="mt-4 text-muted-foreground">
            Two limited badges. Minted to your wallet on Zenith Testnet. Once minted,
            non-transferable forever — proof you were here at the start.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Pioneer card */}
          <div
            onClick={() => setLocation("/badges")}
            className="group cursor-pointer relative rounded-3xl bg-gradient-to-br from-amber-950/60 via-zinc-950 to-zinc-950 border border-amber-900/50 p-8 overflow-hidden hover:border-amber-600/70 transition-all hover:shadow-2xl hover:shadow-amber-900/20"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <img
                src={badgePioneer}
                alt="Zenith Pioneer Badge"
                className="h-48 w-auto object-contain drop-shadow-[0_20px_40px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform"
              />
              <h3 className="mt-6 text-2xl font-bold text-amber-100">Zenith Pioneer</h3>
              <p className="mt-2 text-sm text-amber-100/60 max-w-xs">
                For the wallets that grow the network. Refer 10 friends to qualify.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  Limited · 1,000 only
                </span>
              </div>
            </div>
          </div>

          {/* Genesis card */}
          <div
            onClick={() => setLocation("/badges")}
            className="group cursor-pointer relative rounded-3xl bg-gradient-to-br from-slate-800/60 via-zinc-950 to-zinc-950 border border-slate-700/50 p-8 overflow-hidden hover:border-slate-400/70 transition-all hover:shadow-2xl hover:shadow-slate-700/20"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-slate-400/10 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <img
                src={badgeGenesis}
                alt="Zenith Genesis Badge"
                className="h-48 w-auto object-contain drop-shadow-[0_20px_40px_rgba(148,163,184,0.3)] group-hover:scale-105 transition-transform"
              />
              <h3 className="mt-6 text-2xl font-bold text-slate-100">Zenith Genesis</h3>
              <p className="mt-2 text-sm text-slate-300/60 max-w-xs">
                For the first 10,000 wallets to join the campaign. Pure proof of presence.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-400/20 text-slate-200 font-semibold">
                  Limited · 10,000 only
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setLocation("/badges")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Award className="h-4 w-4" />
            Mint your badge
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-4 md:px-6 py-16 md:py-20 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Four steps to the top of the cohort
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every action you take on Zenith Testnet is logged, scored, and weighted
            against the leaderboard. Bigger streaks compound.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              title: "Connect Wallet",
              desc: "Link MetaMask, OKX, Trust, or any EVM wallet. We auto-add Zenith Testnet for you.",
              Icon: Target,
            },
            {
              step: "02",
              title: "Claim Faucet",
              desc: "Grab 1 ZTH every 5 hours to pay gas while you complete onchain missions.",
              Icon: Droplet,
            },
            {
              step: "03",
              title: "Run Missions",
              desc: "Onchain tasks auto-verify by reading your wallet. Social tasks verify after you connect X / Discord.",
              Icon: Zap,
            },
            {
              step: "04",
              title: "Mint Badges",
              desc: "Soulbound onchain badges (Pioneer, Genesis) lock your status. Limited supply.",
              Icon: Award,
            },
          ].map(({ step, title, desc, Icon }) => (
            <div
              key={step}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="absolute top-4 right-4 text-xs font-mono font-bold text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                {step}
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-20 border-t border-border/50">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Onchain Missions</h3>
            <p className="text-muted-foreground leading-relaxed">
              Send ZTH, deploy contracts, or interact with dApps. Every mission
              reads from the chain to confirm completion — no manual review needed.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">7-Day Streak Rewards</h3>
            <p className="text-muted-foreground leading-relaxed">
              Daily check-ins escalate from 50 ZP to a 300 ZP bonus on day 7.
              Miss two days and the streak resets — so consistency wins.
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Mystery Box Jackpots</h3>
            <p className="text-muted-foreground leading-relaxed">
              Trade ZP for Basic, Rare, or Epic boxes. Epic boxes carry a 5%
              jackpot chance for 25,000 ZP — enough to leap into Elite tier.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-indigo-700 text-primary-foreground p-10 md:p-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              The Genesis cohort closes when the mainnet launches.
            </h2>
            <p className="mt-4 text-primary-foreground/85 max-w-2xl mx-auto">
              Wallets that mint Pioneer or Genesis badges get priority allocation
              in the Zenith ecosystem.
            </p>
            <div className="mt-8 flex justify-center">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-muted/40 py-10 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <ShieldCheck className="h-7 w-7 text-muted-foreground mx-auto mb-3" />
          <p className="text-xs leading-6 text-muted-foreground">
            This is a testnet program. Zenith Points (ZP), Activity Score (AS),
            Reputation Score (RS), and ZTH testnet tokens have no real-world
            monetary value and are not securities. Future rewards are not
            guaranteed. Read our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
