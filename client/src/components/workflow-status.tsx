import { Play, Pause, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStatusProps {
  workflows?: Array<{
    id: number;
    name: string;
    description?: string;
    status: string;
  }>;
}

export default function WorkflowStatus({ workflows = [] }: WorkflowStatusProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleWorkflowMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/workflows/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Workflow Updated",
        description: "Workflow status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleToggleWorkflow = (workflow: any) => {
    const newStatus = workflow.status === "active" ? "paused" : "active";
    toggleWorkflowMutation.mutate({ id: workflow.id, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Running</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const getStatusIndicator = (status: string) => {
    const baseClasses = "w-3 h-3 rounded-full";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-500 animate-pulse`;
      case "paused":
        return `${baseClasses} bg-yellow-500`;
      case "error":
        return `${baseClasses} bg-red-500`;
      default:
        return `${baseClasses} bg-gray-400`;
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workflows</h3>
          <Button className="font-medium">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No workflows configured yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first workflow to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={getStatusIndicator(workflow.status)}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workflow.description || "No description available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(workflow.status)}
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleWorkflow(workflow)}
                      disabled={toggleWorkflowMutation.isPending}
                      className="text-gray-400 hover:text-orange-500"
                    >
                      {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
