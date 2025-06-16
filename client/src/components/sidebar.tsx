import { Bot, Play, Network, Brain, BarChart3, Shield, Settings, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  const menuItems = [
    { icon: Gauge, label: "Dashboard", href: "/dashboard" },
    { icon: Play, label: "Workflows", href: "/workflows", badge: { text: "3 Active", variant: "success" as const } },
    { icon: Network, label: "Proxy Management", href: "/proxies" },
    { icon: Brain, label: "AI Content", href: "/ai-content" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Shield, label: "Safety Controls", href: "/safety" },
    { icon: Settings, label: "Settings", href: "/settings" }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg w-64 min-h-screen border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ProxScr Repli</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">v2.1.0</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge.variant} 
                    className="ml-auto text-xs"
                  >
                    {item.badge.text}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
