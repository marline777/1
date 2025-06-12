import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AIContentQueue from "@/components/ai-content-queue";
import { connectWebSocket } from "@/lib/websocket";

export default function AIContent() {
  const [socket, setSocket] = useState<any>(null);

  const { data: aiContent, refetch: refetchAIContent } = useQuery({
    queryKey: ["/api/ai-content"],
  });

  const { data: metrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    ws.on("ai_content_generated", () => {
      refetchAIContent();
      refetchMetrics();
    });

    ws.on("content_approved", () => {
      refetchAIContent();
      refetchMetrics();
    });

    ws.on("content_rejected", () => {
      refetchAIContent();
      refetchMetrics();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchAIContent, refetchMetrics]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Content Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review and approve AI-generated replies</p>
          </div>
          
          <AIContentQueue aiContent={aiContent} />
        </main>
      </div>
    </div>
  );
}