import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { useGetCheckinStatus, useDailyCheckin, getGetCheckinStatusQueryKey, getGetUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Loader2, CheckCircle2, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Checkin() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useGetCheckinStatus(
    { address: address! },
    { query: { enabled: !!address } }
  );

  const checkin = useDailyCheckin({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Check-in successful! Earned ${data.zpAwarded} ZP`);
        if (data.bonusAwarded > 0) {
          toast.success(`Bonus! Earned an extra ${data.bonusAwarded} ZP`);
        }
        queryClient.invalidateQueries({ queryKey: getGetCheckinStatusQueryKey({ address: address! }) });
        queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(address!) });
      },
      onError: () => {
        toast.error("Failed to check in. Please try again later.");
      }
    }
  });

  const handleCheckin = () => {
    if (!address) return;
    checkin.mutate({ data: { address } });
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
        <div className="container max-w-4xl py-8 px-4 md:px-6">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-4">
              <CalendarCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Check-in</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Check in every day to earn ZP and maintain your streak for weekly bonuses.
            </p>
          </div>

          <Card className="glass-card mt-8 border-primary/20">
            <CardHeader className="text-center pb-2 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                Current Streak: <span className="text-3xl text-primary glow-text">{status?.streakCount || 0}</span> days
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-7 gap-2 sm:gap-4">
                    {status?.days.map((day) => (
                      <div 
                        key={day.day} 
                        className={`
                          flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all
                          ${day.completed ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-transparent'}
                          ${day.isToday && !day.completed ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-105' : ''}
                          ${day.isBonus ? 'bg-gradient-to-b from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : ''}
                        `}
                      >
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{day.label}</span>
                        
                        {day.completed ? (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2 shadow-lg shadow-primary/30">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : day.isBonus ? (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-500/30">
                            <Star className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 font-bold text-sm
                            ${day.isToday ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-muted text-muted-foreground'}
                          `}>
                            +{day.reward}
                          </div>
                        )}
                        
                        {day.isBonus && !day.completed && (
                          <span className="text-[10px] font-bold text-orange-500 uppercase">Bonus</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {!status?.canCheckin && timeLeft > 0 ? (
                      <div className="flex flex-col items-center space-y-2 bg-muted/50 rounded-lg p-6 w-full max-w-sm border border-border/50">
                        <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Next check-in available in</div>
                        <div className="text-3xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</div>
                      </div>
                    ) : (
                      <Button 
                        size="lg" 
                        className="w-full max-w-sm text-lg h-14"
                        onClick={handleCheckin}
                        disabled={checkin.isPending || !status?.canCheckin}
                      >
                        {checkin.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CalendarCheck className="mr-2 h-5 w-5" />}
                        Check In Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}