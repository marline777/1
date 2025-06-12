import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import ProxyStatus from "@/components/proxy-status";
import { connectWebSocket } from "@/lib/websocket";

export default function Proxies() {
  const [socket, setSocket] = useState<any>(null);

  const { data: proxyStats, refetch: refetchProxyStats } = useQuery({
    queryKey: ["/api/proxies/stats"],
  });

  const { data: activities, refetch: refetchActivities } = useQuery({
    queryKey: ["/api/activities"],
  });

  useEffect(() => {
    const ws = connectWebSocket();
    setSocket(ws);

    ws.on("proxies_synced", () => {
      refetchProxyStats();
      refetchActivities();
    });

    return () => {
      ws.disconnect();
    };
  }, [refetchProxyStats, refetchActivities]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header />
        
        <main className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proxy Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage proxy connections and validation</p>
          </div>
          
          <ProxyStatus proxyStats={proxyStats} />
        </main>
      </div>
    </div>
  );
}