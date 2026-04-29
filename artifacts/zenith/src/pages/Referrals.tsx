import { Layout } from "@/components/Layout";
import { useGetReferralInfo, getGetReferralInfoQueryKey } from "@workspace/api-client-react";
import { useAccount } from "wagmi";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Copy, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Referrals() {
  const { address } = useAccount();
  const { data, isLoading } = useGetReferralInfo(address!, {
    query: { queryKey: getGetReferralInfoQueryKey(address!), enabled: !!address }
  });

  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className="container max-w-5xl py-8 px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
            <p className="text-muted-foreground mt-1">Invite friends to Zenith Testnet and earn passive ZP.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card md:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Invite Link
                </CardTitle>
                <CardDescription>Share this link to earn 10% of your friends' ZP earnings forever.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="bg-background border border-border/50 rounded-lg p-4 flex-1 text-sm font-mono overflow-x-auto whitespace-nowrap w-full">
                    {data?.referralLink || 'Loading...'}
                  </div>
                  <Button onClick={copyLink} size="lg" className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary/20">
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm bg-background/50 p-3 rounded-lg border border-border/30">
                  <span className="text-muted-foreground">Your Code</span>
                  <span className="font-mono font-bold tracking-widest text-primary">{data?.referralCode || '...'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned from Invites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold glow-text text-primary mb-2">+{data?.totalZpEarned.toLocaleString() || 0} ZP</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  from {data?.totalInvited || 0} friends
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Network</CardTitle>
              <CardDescription>People who joined using your link</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.invitees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted mb-4" />
                  <p>You haven't invited anyone yet.</p>
                  <p className="text-sm mt-1">Share your link above to get started!</p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-border/50">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">ZP Generated for You</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.invitees.map((invitee) => (
                        <TableRow key={invitee.invitee} className="border-border/50">
                          <TableCell className="font-mono text-sm">
                            {invitee.invitee.slice(0, 6)}...{invitee.invitee.slice(-4)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(invitee.joinedAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            +{invitee.zpEarned.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}