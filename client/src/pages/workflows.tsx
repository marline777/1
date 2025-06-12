import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import WorkflowStatus from "@/components/workflow-status";
import { connectWebSocket } from "@/lib/websocket";

export default function Workflows() {
  const [socket, setSocket] = useState<any>(null);

  const { data: workflows, refetch: refetchWorkflows } = useQuery({
    queryKey: ["/api/workflows"],
  });

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    ws.on("workflow_created", () => {
      refetchWorkflows();
      refetchMetrics();
    });

    ws.on("workflow_status_changed", () => {
      refetchWorkflows();
      refetchMetrics();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchMetrics, refetchWorkflows]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and control your automation workflows</p>
          </div>
          
          <WorkflowStatus workflows={workflows} />
        </main>
      </div>
    </div>
  );
}