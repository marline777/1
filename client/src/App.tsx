import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import Proxies from "@/pages/proxies";
import AIContent from "@/pages/ai-content";
import Analytics from "@/pages/analytics";
import Safety from "@/pages/safety";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/proxies" component={Proxies} />
      <Route path="/ai-content" component={AIContent} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/safety" component={Safety} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
