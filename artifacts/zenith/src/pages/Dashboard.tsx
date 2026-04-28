import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUser, useGetActivityFeed } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { ArrowRight, Activity, CalendarCheck, Package, Droplet, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { address } = useAccount();
  const { data: user, isLoading: userLoading } = useGetUser(address!, {
    query: { enabled: !!address }
  });
  
  const { data: activities, isLoading: activitiesLoading } = useGetActivityFeed(address!, { limit: 5 }, {
    query: { enabled: !!address }
  });

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-6xl py-8 px-4 md:px-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back to Mission Control</p>
            </div>
            
            {user && (
              <Badge variant="outline" className="px-4 py-2 border-primary/30 bg-primary/5 text-primary text-sm font-semibold uppercase tracking-wider">
                {user.tier} TIER
              </Badge>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total ZP</CardTitle>
              </CardHeader>
              <CardContent>
                {userLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-bold glow-text text-primary">{user?.zp?.toLocaleString() || 0}</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Activity Score</CardTitle>
              </CardHeader>
              <CardContent>
                {userLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-bold">{user?.as?.toLocaleString() || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Leaderboard Rank</CardTitle>
              </CardHeader>
              <CardContent>
                {userLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-bold">#{user?.rank?.toLocaleString() || '---'}</div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
              </CardHeader>
              <CardContent>
                {userLoading ? <Skeleton className="h-8 w-24" /> : (
                  <div className="text-3xl font-bold">{user?.streakCount || 0} <span className="text-xl text-muted-foreground font-normal">days</span></div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/checkin">
                  <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarCheck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        Daily Check-in
                      </CardTitle>
                      <CardDescription>Maintain your streak for bonuses</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                
                <Link href="/faucet">
                  <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Droplet className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        Testnet Faucet
                      </CardTitle>
                      <CardDescription>Claim ZTH for transactions</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/missions">
                  <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        Missions
                      </CardTitle>
                      <CardDescription>Complete tasks to earn ZP</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/boxes">
                  <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        Mystery Boxes
                      </CardTitle>
                      <CardDescription>Open boxes for random rewards</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                Recent Activity
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {activitiesLoading ? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : activities?.length ? (
                      activities.map((log) => (
                        <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-sm">{log.action}</div>
                            {log.detail && <div className="text-xs text-muted-foreground mt-0.5">{log.detail}</div>}
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                          {log.zpDelta !== 0 && (
                            <div className={`text-sm font-bold whitespace-nowrap ${log.zpDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {log.zpDelta > 0 ? '+' : ''}{log.zpDelta} ZP
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No recent activity.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}