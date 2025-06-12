import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MetricsGrid from "@/components/metrics-grid";
import WorkflowStatus from "@/components/workflow-status";
import ActivityFeed from "@/components/activity-feed";
import ProxyStatus from "@/components/proxy-status";
import AIContentQueue from "@/components/ai-content-queue";
import SafetyControls from "@/components/safety-controls";
import AnalyticsCharts from "@/components/analytics-charts";
import { connectWebSocket } from "@/lib/websocket";

export default function Dashboard() {
  const [socket, setSocket] = useState<any>(null);

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  const { data: workflows, refetch: refetchWorkflows } = useQuery({
    queryKey: ["/api/workflows"],
  });

  const { data: activities, refetch: refetchActivities } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: aiContent, refetch: refetchAIContent } = useQuery({
    queryKey: ["/api/ai-content"],
  });

  const { data: proxyStats, refetch: refetchProxyStats } = useQuery({
    queryKey: ["/api/proxies/stats"],
  });

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    // Listen for real-time updates
    ws.on("workflow_created", () => {
      refetchWorkflows();
      refetchMetrics();
    });

    ws.on("workflow_status_changed", () => {
      refetchWorkflows();
      refetchMetrics();
    });

    ws.on("tweet_scraped", () => {
      refetchMetrics();
      refetchActivities();
    });

    ws.on("ai_content_generated", () => {
      refetchAIContent();
      refetchMetrics();
      refetchActivities();
    });

    ws.on("content_approved", () => {
      refetchAIContent();
      refetchMetrics();
    });

    ws.on("content_rejected", () => {
      refetchAIContent();
      refetchMetrics();
    });

    ws.on("proxies_synced", () => {
      refetchProxyStats();
      refetchActivities();
    });

    ws.on("setting_updated", () => {
      refetchSettings();
    });

    ws.on("emergency_stop_activated", () => {
      refetchWorkflows();
      refetchMetrics();
      refetchActivities();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchMetrics, refetchWorkflows, refetchActivities, refetchAIContent, refetchProxyStats, refetchSettings]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <MetricsGrid metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WorkflowStatus workflows={workflows} />
              <ActivityFeed activities={activities} />
            </div>
            
            <div className="space-y-6">
              <ProxyStatus proxyStats={proxyStats} />
              <AIContentQueue aiContent={aiContent} />
              <SafetyControls settings={settings} />
            </div>
          </div>
          
          <AnalyticsCharts />
        </main>
      </div>
    </div>
  );
}
