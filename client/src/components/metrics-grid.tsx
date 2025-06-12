import { Play, Twitter, Network, Brain, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsGridProps {
  metrics?: {
    activeWorkflows: number;
    tweetsProcessed: number;
    proxySuccessRate: number;
    aiResponses: number;
    pendingApprovals: number;
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const defaultMetrics = {
    activeWorkflows: 0,
    tweetsProcessed: 0,
    proxySuccessRate: 0,
    aiResponses: 0,
    pendingApprovals: 0
  };

  const data = metrics || defaultMetrics;

  const metricCards = [
    {
      title: "Active Workflows",
      value: data.activeWorkflows.toString(),
      change: "+2 new today",
      icon: Play,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: "up"
    },
    {
      title: "Tweets Processed", 
      value: data.tweetsProcessed.toLocaleString(),
      change: "+18% from yesterday",
      icon: Twitter,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      trend: "up"
    },
    {
      title: "Proxy Success Rate",
      value: `${(typeof data.proxySuccessRate === 'string' ? parseFloat(data.proxySuccessRate) : data.proxySuccessRate).toFixed(1)}%`,
      change: "Excellent performance",
      icon: Network,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      trend: "up"
    },
    {
      title: "AI Responses",
      value: data.aiResponses.toString(),
      change: `${data.pendingApprovals} pending approval`,
      icon: Brain,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      trend: "pending"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{metric.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  metric.trend === "up" ? "text-green-600" : 
                  metric.trend === "pending" ? "text-orange-600" : "text-gray-500"
                }`}>
                  {metric.trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
                  {metric.trend === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {metric.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`${metric.iconColor} h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
