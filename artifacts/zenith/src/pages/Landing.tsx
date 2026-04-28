import { Layout } from "@/components/Layout";
import { useGetGlobalStats } from "@workspace/api-client-react";
import { useAccount } from "wagmi";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Logo } from "@/components/Logo";
import { Target, Package, ShieldCheck, Zap } from "lucide-react";

export default function Landing() {
  const { isConnected } = useAccount();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isConnected) {
      setLocation("/dashboard");
    }
  }, [isConnected, setLocation]);

  const { data: stats } = useGetGlobalStats();

  return (
    <Layout>
      <div className="relative isolate pt-14">
        {/* Hero Section */}
        <div className="py-20 sm:py-28 lg:pb-32 text-center px-6">
          <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center mb-8">
              <Logo size="xl" showText={false} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Genesis Phase · ChainID 95749
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              ZENITH{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 glow-text">
                Genesis Campaign
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Mission control for the Zenith Testnet. Complete onchain missions,
              claim daily ZTH, open mystery boxes, and secure your place in the
              Genesis cohort.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ConnectWalletButton />
              <a
                href="https://explorer.zenithchain.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Open Block Explorer →
              </a>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        {stats && (
          <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8 animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-both">
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Total Users</div>
                <div className="text-3xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Transactions</div>
                <div className="text-3xl font-bold text-foreground">{stats.totalTransactions.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Missions Done</div>
                <div className="text-3xl font-bold text-foreground">{stats.totalMissionsCompleted.toLocaleString()}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">ZP Awarded</div>
                <div className="text-3xl font-bold text-primary glow-text">{stats.totalZpAwarded.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 border-t border-border/50">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary tracking-wide uppercase">Core Activities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Earn your rank in the Zenith ecosystem
            </p>
          </div>
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Onchain Missions</h3>
                <p className="text-base leading-7 text-muted-foreground flex-auto">
                  Execute specific tasks on the Zenith testnet to prove your skills and earn Zenith Points (ZP).
                </p>
              </div>
              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Daily Check-ins</h3>
                <p className="text-base leading-7 text-muted-foreground flex-auto">
                  Maintain your daily streak to multiply your rewards and climb the leaderboard faster.
                </p>
              </div>
              <div className="flex flex-col">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Mystery Boxes</h3>
                <p className="text-base leading-7 text-muted-foreground flex-auto">
                  Trade ZP for Mystery Boxes to win massive jackpots and exclusive rewards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-muted/50 py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm leading-6 text-muted-foreground max-w-2xl mx-auto">
              Zenith Points (ZP), Activity Score (AS), and Reputation Score (RS) may be used for future rewards. This is a testnet program with no guaranteed value. Participate at your own discretion.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
