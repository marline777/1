import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import SafetyControls from "@/components/safety-controls";
import { connectWebSocket } from "@/lib/websocket";

export default function Safety() {
  const [socket, setSocket] = useState<any>(null);

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    ws.on("setting_updated", () => {
      refetchSettings();
    });

    ws.on("emergency_stop_activated", () => {
      refetchSettings();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchSettings]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Safety Controls</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Configure safety settings and emergency controls</p>
          </div>
          
          <SafetyControls settings={settings} />
        </main>
      </div>
    </div>
  );
}