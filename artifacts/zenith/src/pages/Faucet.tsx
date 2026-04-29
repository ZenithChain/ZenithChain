import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { useGetFaucetStatus, useClaimFaucet, getGetFaucetStatusQueryKey, getGetUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, ExternalLink, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { zenithTestnet } from "@/lib/wagmi";

export default function Faucet() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useGetFaucetStatus(
    { address: address! },
    { query: { enabled: !!address } }
  );

  const claim = useClaimFaucet({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Successfully claimed ${data.amount} ZTH!`);
        queryClient.invalidateQueries({ queryKey: getGetFaucetStatusQueryKey({ address: address! }) });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(address!) });
      },
      onError: (err) => {
        toast.error("Failed to claim from faucet. Please try again later.");
      }
    }
  });

  const handleClaim = () => {
    if (!address) return;
    claim.mutate({ data: { address } });
  };

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (status?.cooldownSecondsRemaining) {
      setTimeLeft(status.cooldownSecondsRemaining);
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status?.cooldownSecondsRemaining]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-3xl py-8 px-4 md:px-6">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-4">
              <Droplet className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Testnet Faucet</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Claim Zenith testnet tokens (ZTH) to pay for transaction gas fees while completing missions.
            </p>
          </div>

          <Card className="glass-card mt-8">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Claim ZTH</CardTitle>
              <CardDescription>Claim {status?.amount ?? 1} ZTH every 5 hours. Used to pay gas while completing onchain missions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <div className="text-5xl font-bold glow-text text-foreground">
                    +{status?.amount || 1} <span className="text-3xl text-primary">ZTH</span>
                  </div>

                  {!status?.canClaim && timeLeft > 0 ? (
                    <div className="flex flex-col items-center space-y-2 bg-muted/50 rounded-lg p-6 w-full max-w-sm border border-border/50">
                      <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cooldown Active</div>
                      <div className="text-3xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full max-w-sm text-lg h-14"
                      onClick={handleClaim}
                      disabled={claim.isPending || !status?.canClaim}
                    >
                      {claim.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Droplet className="mr-2 h-5 w-5" />}
                      Claim ZTH
                    </Button>
                  )}

                  {status?.lastTxHash && (
                    <a 
                      href={`${zenithTestnet.blockExplorers.default.url}/tx/${status.lastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline mt-4"
                    >
                      View last claim transaction <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
