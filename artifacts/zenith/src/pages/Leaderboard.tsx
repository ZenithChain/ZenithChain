import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { address } = useAccount();
  const { data, isLoading } = useGetLeaderboard({ address }, {
    query: { queryKey: getGetLeaderboardQueryKey({ address }), enabled: true } // always enabled, pass address if exists
  });

  const getTierColor = (tier: string) => {
    switch(tier.toLowerCase()) {
      case 'elite': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'gold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'silver': return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
      case 'bronze': return 'bg-orange-600/10 text-orange-600 border-orange-600/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Top {data?.totalUsers || '...'} Zenith Testnet users</p>
        </div>

        {data?.you && (
          <div className="mb-8 glass-card p-4 rounded-lg border-primary/30 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold w-12 text-center text-primary">#{data.you.rank}</div>
              <div>
                <div className="font-mono font-medium">{data.you.walletAddress}</div>
                <div className="text-sm text-muted-foreground">Your Current Rank</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-xl">{data.you.finalScore.toLocaleString()} pts</div>
              <Badge variant="outline" className={getTierColor(data.you.tier)}>{data.you.tier}</Badge>
            </div>
          </div>
        )}

        <div className="glass-card rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Total ZP</TableHead>
                <TableHead className="text-right">Final Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                data?.entries.map((entry) => (
                  <TableRow 
                    key={entry.walletAddress}
                    className={`border-border/50 transition-colors hover:bg-muted/50 ${entry.walletAddress === address ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="text-center font-bold">
                      {entry.rank <= 3 ? (
                        <span className={`
                          ${entry.rank === 1 ? 'text-yellow-500 text-lg glow-text' : ''}
                          ${entry.rank === 2 ? 'text-slate-300 text-lg glow-text' : ''}
                          ${entry.rank === 3 ? 'text-orange-500 text-lg glow-text' : ''}
                        `}>#{entry.rank}</span>
                      ) : (
                        <span className="text-muted-foreground">#{entry.rank}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                      {entry.walletAddress === address && <span className="ml-2 text-xs text-primary font-sans">(You)</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${getTierColor(entry.tier)}`}>
                        {entry.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{entry.zp.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">{entry.finalScore.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}