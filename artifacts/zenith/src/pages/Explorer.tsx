import { Layout } from "@/components/Layout";
import { useExplorerSearch, useGetLatestBlocks, useGetLatestTransactions } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Box, ArrowRightLeft, Clock, Zap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Explorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: blocks } = useGetLatestBlocks({ limit: 10 }, {
    query: { refetchInterval: 12000 }
  });

  const { data: txs } = useGetLatestTransactions({ limit: 10 }, {
    query: { refetchInterval: 12000 }
  });

  const { data: searchResult, isLoading: isSearchLoading } = useExplorerSearch(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 2 } }
  );

  const shortenHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <Layout>
      <div className="container max-w-6xl py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Network Explorer</h1>
          <p className="text-muted-foreground mt-1">Live Zenith Testnet blocks and transactions</p>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            className="w-full h-14 pl-12 pr-4 bg-background/50 backdrop-blur-sm border-primary/20 text-lg rounded-xl shadow-lg focus-visible:ring-primary"
            placeholder="Search by Address / Txn Hash / Block Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearchLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
          )}
        </div>

        {searchResult && searchResult.kind !== 'none' ? (
          <div className="mb-12 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <Card className="glass-card border-primary/30">
              <CardContent className="p-6">
                {searchResult.kind === 'address' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>Address</Badge>
                      <span className="font-mono font-medium">{searchResult.address}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recent Transactions</h3>
                      <div className="space-y-2">
                        {searchResult.recentTransactions?.map(tx => (
                          <div key={tx.hash} className="flex justify-between items-center p-3 rounded bg-muted/30 border border-border/50 text-sm">
                            <span className="font-mono text-primary">{shortenHash(tx.hash)}</span>
                            <span className="text-muted-foreground">{tx.value} ZTH</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {searchResult.kind === 'tx' && searchResult.transaction && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Transaction</Badge>
                      <span className="font-mono font-medium">{searchResult.transaction.hash}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <div className="text-muted-foreground mb-1">From</div>
                        <div className="font-mono">{searchResult.transaction.from}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">To</div>
                        <div className="font-mono">{searchResult.transaction.to}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Value</div>
                        <div className="font-bold">{searchResult.transaction.value} ZTH</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Block</div>
                        <div>{searchResult.transaction.blockNumber}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Latest Blocks
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-border/50">
              {blocks?.map((block) => (
                <div key={block.hash} className="p-4 flex justify-between items-center hover:bg-muted/20 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded bg-muted/50 flex flex-col items-center justify-center shrink-0">
                      <Box className="h-4 w-4 text-muted-foreground mb-0.5" />
                      <span className="text-[10px] font-medium text-muted-foreground">Bk</span>
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{block.number}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{block.txCount} txns</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Miner: <span className="font-mono text-primary/80">{shortenAddress(block.miner)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Latest Transactions
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-border/50">
              {txs?.map((tx) => (
                <div key={tx.hash} className="p-4 flex justify-between items-center hover:bg-muted/20 transition-colors">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="h-10 w-10 rounded bg-muted/50 flex flex-col items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-muted-foreground mb-0.5" />
                      <span className="text-[10px] font-medium text-muted-foreground">Tx</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm text-primary truncate">{shortenHash(tx.hash)}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                        <span className="font-mono">{shortenAddress(tx.from)}</span>
                        <ArrowRightLeft className="h-3 w-3 mx-1 shrink-0" />
                        <span className="font-mono">{shortenAddress(tx.to)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-foreground font-mono">
                      {tx.value} ZTH
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}