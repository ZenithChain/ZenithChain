import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PageGuard } from "@/components/PageGuard";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import Faucet from "@/pages/Faucet";
import Checkin from "@/pages/Checkin";
import Boxes from "@/pages/Boxes";
import Leaderboard from "@/pages/Leaderboard";
import Explorer from "@/pages/Explorer";
import Referrals from "@/pages/Referrals";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Badges from "@/pages/Badges";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/missions">
        <PageGuard pageKey="missions"><Missions /></PageGuard>
      </Route>
      <Route path="/faucet">
        <PageGuard pageKey="faucet"><Faucet /></PageGuard>
      </Route>
      <Route path="/checkin">
        <PageGuard pageKey="checkin"><Checkin /></PageGuard>
      </Route>
      <Route path="/boxes">
        <PageGuard pageKey="boxes"><Boxes /></PageGuard>
      </Route>
      <Route path="/leaderboard">
        <PageGuard pageKey="leaderboard"><Leaderboard /></PageGuard>
      </Route>
      <Route path="/explorer">
        <PageGuard pageKey="explorer"><Explorer /></PageGuard>
      </Route>
      <Route path="/referrals">
        <PageGuard pageKey="referrals"><Referrals /></PageGuard>
      </Route>
      <Route path="/badges">
        <PageGuard pageKey="badges"><Badges /></PageGuard>
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
