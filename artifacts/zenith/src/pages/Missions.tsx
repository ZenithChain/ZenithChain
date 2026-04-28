import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAccount } from "wagmi";
import { useListMissions, useCompleteMission, getListMissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Missions() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  const { data: missions, isLoading } = useListMissions(
    { address },
    { query: { enabled: !!address } }
  );

  const completeMission = useCompleteMission({
    mutation: {
      onSuccess: (data, variables) => {
        toast.success(`Mission completed! Earned ${data.zpAwarded} ZP`);
        queryClient.invalidateQueries({ queryKey: getListMissionsQueryKey({ address }) });
      },
      onError: (err) => {
        toast.error("Failed to complete mission.");
      }
    }
  });

  const handleAction = (slug: string, url?: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
    completeMission.mutate({ data: { address: address!, missionSlug: slug } });
  };

  const basicMissions = missions?.filter(m => m.type === 'basic') || [];
  const advancedMissions = missions?.filter(m => m.type === 'advanced') || [];
  const socialMissions = missions?.filter(m => m.type === 'social') || [];

  const MissionList = ({ list }: { list: typeof missions }) => {
    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!list?.length) return <div className="text-center p-12 text-muted-foreground">No missions available.</div>;

    return (
      <div className="grid gap-4 mt-6">
        {list.map((mission) => (
          <Card key={mission.id} className={`glass-card transition-all ${mission.completed ? 'opacity-70 grayscale-[0.5]' : 'hover:border-primary/50'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{mission.name}</h3>
                  {mission.completed && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl">{mission.description}</p>
                {mission.completed && mission.completedAt && (
                  <p className="text-xs text-muted-foreground/70">Completed on {format(new Date(mission.completedAt), 'MMM d, yyyy')}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto sm:flex-col sm:items-end sm:gap-2">
                <div className="font-bold text-primary">+{mission.reward} ZP</div>
                <Button 
                  onClick={() => handleAction(mission.slug, mission.actionUrl)}
                  disabled={mission.completed || completeMission.isPending}
                  className="w-full sm:w-auto"
                >
                  {mission.completed ? 'Completed' : (mission.actionLabel || 'Complete')}
                  {mission.actionUrl && !mission.completed && <ExternalLink className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-5xl py-8 px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Missions</h1>
            <p className="text-muted-foreground mt-1">Complete tasks to earn Zenith Points and increase your rank.</p>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <MissionList list={basicMissions} />
            </TabsContent>
            <TabsContent value="advanced">
              <MissionList list={advancedMissions} />
            </TabsContent>
            <TabsContent value="social">
              <MissionList list={socialMissions} />
            </TabsContent>
          </Tabs>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
