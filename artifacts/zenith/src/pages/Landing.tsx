import { Layout } from "@/components/Layout";
import { useGetGlobalStats } from "@workspace/api-client-react";
import { useAccount } from "wagmi";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Mascot } from "@/components/Mascot";
import { Logo } from "@/components/Logo";
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
} from "lucide-react";

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
      {/* Hero — Sky background with eagle */}
      <section className="relative overflow-hidden">
        {/* Sky gradient background */}
        <div className="absolute inset-0 -z-10 sky-bg" />
        {/* Cloud layers */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
        </div>
        {/* Mountain silhouette at bottom */}
        <svg
          className="absolute bottom-0 left-0 right-0 -z-10 w-full h-32 md:h-48 text-background/95"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,240 L0,140 L120,80 L260,160 L400,60 L560,180 L720,40 L880,160 L1040,80 L1200,180 L1340,100 L1440,140 L1440,240 Z" />
        </svg>

        <div className="container relative mx-auto px-4 md:px-6 pt-16 pb-32 md:pt-24 md:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Copy + CTA */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white shadow-lg mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Genesis Phase Live · ChainID 95749
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)] leading-[1.05]">
                Soar above
                <br />
                the testnet.
              </h1>
              <p className="mt-6 text-base md:text-lg leading-relaxed text-white/90 max-w-xl mx-auto lg:mx-0 drop-shadow">
                Complete onchain missions, claim daily ZTH, open mystery boxes,
                and climb to <span className="font-semibold text-white">Elite</span> tier.
                Genesis Cohort wallets earn priority allocation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <ConnectWalletButton />
                <a
                  href="#how-it-works"
                  className="text-sm font-semibold text-white hover:text-white/80 transition-colors flex items-center gap-1.5 group"
                >
                  How it works
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Trust row */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { label: "EVM", value: "Compatible" },
                  { label: "Avg Block", value: "~12s" },
                  { label: "Native", value: "ZTH" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                      {item.label}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Eagle mascot */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <Mascot size="xl" className="animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      {stats && (
        <section className="relative -mt-16 z-20 mb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-card border border-border/60 rounded-2xl p-5 md:p-6 shadow-2xl">
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
                    className="flex items-center gap-3 px-2 md:px-4 py-2 border-r border-border/60 last:border-r-0 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide font-medium truncate">
                        {s.label}
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-foreground tabular-nums">
                        {s.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            How It Works
          </div>
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
              title: "Climb Tiers",
              desc: "Bronze → Silver → Gold → Elite. Each tier multiplies your ZP and final score.",
              Icon: Trophy,
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

      {/* Feature Highlights */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-border/50">
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
              Wallets that climb to Gold or Elite tier before mainnet receive priority
              allocation in the Zenith ecosystem.
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
