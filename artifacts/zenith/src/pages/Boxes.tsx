import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { useListBoxes, useOpenBox, getGetUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Boxes() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: boxes, isLoading } = useListBoxes();
  
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [rewardResult, setRewardResult] = useState<{zp: number, isJackpot: boolean} | null>(null);

  const openBox = useOpenBox({
    mutation: {
      onSuccess: (data) => {
        setIsOpening(false);
        setRewardResult({ zp: data.zpReward, isJackpot: data.isJackpot });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(address!) });
        
        if (data.isJackpot) {
          toast.success(`JACKPOT! You won ${data.zpReward} ZP!`);
        }
      },
      onError: (err) => {
        setIsOpening(false);
        setSelectedBox(null);
        toast.error("Failed to open box. Do you have enough ZP?");
      }
    }
  });

  const handleOpen = (rarity: string) => {
    setSelectedBox(rarity);
  };

  const confirmOpen = () => {
    if (!address || !selectedBox) return;
    setIsOpening(true);
    openBox.mutate({ data: { address, rarity: selectedBox as any } });
  };

  const resetState = () => {
    setSelectedBox(null);
    setRewardResult(null);
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-5xl py-8 px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Mystery Boxes</h1>
            <p className="text-muted-foreground mt-1">Spend your ZP for a chance to win massive jackpots.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {boxes?.map((box) => (
                <Card key={box.rarity} className={`
                  glass-card relative overflow-hidden group transition-all hover:-translate-y-1
                  ${box.rarity === 'epic' ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : ''}
                  ${box.rarity === 'rare' ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}
                `}>
                  {box.rarity === 'epic' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                  )}
                  
                  <CardHeader className="text-center pb-4 relative z-10">
                    <div className="mx-auto w-20 h-20 mb-4 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Package className={`h-10 w-10 ${
                        box.rarity === 'epic' ? 'text-purple-500' : 
                        box.rarity === 'rare' ? 'text-blue-500' : 'text-primary'
                      }`} />
                    </div>
                    <CardTitle className="text-2xl uppercase tracking-wider">{box.name}</CardTitle>
                    <CardDescription>{box.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-bold">{box.cost.toLocaleString()} ZP</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-muted-foreground">Reward Range</span>
                        <span className="font-semibold">{box.minReward.toLocaleString()} - {box.maxReward.toLocaleString()} ZP</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="h-3 w-3 text-yellow-500"/> Jackpot</span>
                        <span className="font-bold text-yellow-500 glow-text">{box.jackpot.toLocaleString()} ZP</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10 pt-4">
                    <Button 
                      className={`w-full ${
                        box.rarity === 'epic' ? 'bg-purple-600 hover:bg-purple-700' : 
                        box.rarity === 'rare' ? 'bg-blue-600 hover:bg-blue-700' : ''
                      }`}
                      onClick={() => handleOpen(box.rarity)}
                    >
                      Open Box
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selectedBox} onOpenChange={(open) => !open && !isOpening && resetState()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {rewardResult ? 'Box Opened!' : 'Confirm Open'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {rewardResult ? '' : `Are you sure you want to spend ZP to open a ${selectedBox} box?`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-8">
              {isOpening ? (
                <div className="flex flex-col items-center space-y-4">
                  <Package className="h-20 w-20 text-primary animate-bounce" />
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="font-medium animate-pulse text-muted-foreground">Unlocking mystery...</p>
                </div>
              ) : rewardResult ? (
                <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-500">
                  <div className={`text-6xl font-bold ${rewardResult.isJackpot ? 'text-yellow-500 glow-text' : 'text-primary'}`}>
                    +{rewardResult.zp.toLocaleString()} <span className="text-3xl">ZP</span>
                  </div>
                  {rewardResult.isJackpot && (
                    <Badge variant="outline" className="px-4 py-2 text-lg bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse">
                      <Sparkles className="mr-2 h-5 w-5" />
                      JACKPOT WINNER!
                    </Badge>
                  )}
                </div>
              ) : (
                <Package className="h-24 w-24 text-muted-foreground/50" />
              )}
            </div>

            <DialogFooter className="sm:justify-center">
              {!isOpening && !rewardResult && (
                <>
                  <Button variant="outline" onClick={resetState}>Cancel</Button>
                  <Button onClick={confirmOpen} disabled={openBox.isPending}>Confirm</Button>
                </>
              )}
              {rewardResult && (
                <Button className="w-full" onClick={resetState}>Awesome</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </ProtectedRoute>
    </Layout>
  );
}