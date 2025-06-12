import { Github, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProxyStatusProps {
  proxyStats?: {
    active: number;
    total: number;
    successRate: number;
    avgSpeed: number;
  };
}

export default function ProxyStatus({ proxyStats }: ProxyStatusProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncProxiesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/proxies/sync"),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies/stats"] });
      toast({
        title: "Proxies Synced",
        description: `Successfully synced ${response.synced} new proxies from GitHub.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const defaultStats = {
    active: 0,
    total: 0,
    successRate: 0,
    avgSpeed: 0
  };

  const stats = proxyStats || defaultStats;
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proxy Network</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active Proxies</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {stats.active}/{stats.total}
          </span>
        </div>
        
        <Progress value={activePercentage} className="w-full" />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{(typeof stats.successRate === 'string' ? parseFloat(stats.successRate) : stats.successRate).toFixed(1)}%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.avgSpeed}ms</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">GitHub Integration</span>
            <Badge variant="success" className="text-xs">Connected</Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">marline777/proxscr_repli</p>
          <Button
            onClick={() => syncProxiesMutation.mutate()}
            disabled={syncProxiesMutation.isPending}
            variant="outline"
            className="w-full font-medium"
          >
            {syncProxiesMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Sync Proxy List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
