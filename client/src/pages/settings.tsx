import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { connectWebSocket } from "@/lib/websocket";

export default function Settings() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Configure automation parameters and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="scraping-enabled">Enable Scraping</Label>
                  <Switch id="scraping-enabled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scraping-interval">Scraping Interval (minutes)</Label>
                  <Input id="scraping-interval" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-engagement">Minimum Engagement Threshold</Label>
                  <Input id="min-engagement" type="number" placeholder="20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Content Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-enabled">Enable AI Generation</Label>
                  <Switch id="ai-enabled" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality-threshold">Quality Score Threshold</Label>
                  <Input id="quality-threshold" type="number" placeholder="70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-daily-replies">Max Daily Replies</Label>
                  <Input id="max-daily-replies" type="number" placeholder="50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proxy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proxy-rotation">Proxy Rotation Interval (requests)</Label>
                  <Input id="proxy-rotation" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proxy-timeout">Request Timeout (seconds)</Label>
                  <Input id="proxy-timeout" type="number" placeholder="30" />
                </div>
                <Button variant="outline" className="w-full">
                  Test All Proxies
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requests-per-minute">Requests per Minute</Label>
                  <Input id="requests-per-minute" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay-between-requests">Delay Between Requests (ms)</Label>
                  <Input id="delay-between-requests" type="number" placeholder="2000" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="randomize-delays">Randomize Delays</Label>
                  <Switch id="randomize-delays" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </main>
      </div>
    </div>
  );
}