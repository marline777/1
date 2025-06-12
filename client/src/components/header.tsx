import { Moon, Sun, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const emergencyStopMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/emergency-stop"),
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "All workflows have been stopped successfully.",
        variant: "destructive"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Emergency Stop Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEmergencyStop = () => {
    if (window.confirm("Are you sure you want to stop all workflows? This action cannot be undone.")) {
      emergencyStopMutation.mutate();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor your social media automation workflows</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Badge variant="success" className="flex items-center space-x-2 px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Active</span>
          </Badge>
          
          <Button
            variant="destructive"
            onClick={handleEmergencyStop}
            disabled={emergencyStopMutation.isPending}
            className="font-medium"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Emergency Stop
          </Button>
        </div>
      </div>
    </header>
  );
}
