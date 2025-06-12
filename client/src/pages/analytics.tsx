import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AnalyticsCharts from "@/components/analytics-charts";
import MetricsGrid from "@/components/metrics-grid";
import { connectWebSocket } from "@/lib/websocket";

export default function Analytics() {
  const [socket, setSocket] = useState<any>(null);

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    ws.on("workflow_status_changed", () => {
      refetchMetrics();
    });

    ws.on("tweet_scraped", () => {
      refetchMetrics();
    });

    ws.on("ai_content_generated", () => {
      refetchMetrics();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchMetrics]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Performance</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor system performance and engagement metrics</p>
          </div>
          
          <MetricsGrid metrics={metrics} />
          <AnalyticsCharts />
        </main>
      </div>
    </div>
  );
}