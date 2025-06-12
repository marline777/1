import { Check, X, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIContentQueueProps {
  aiContent?: Array<{
    id: number;
    content: string;
    qualityScore: number;
    targetTweetId: string;
    type: string;
  }>;
}

export default function AIContentQueue({ aiContent = [] }: AIContentQueueProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/ai-content/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Content Approved",
        description: "The AI-generated content has been approved for posting.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const rejectContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/ai-content/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Content Rejected",
        description: "The AI-generated content has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const pendingContent = aiContent.filter(content => content.type === "reply");
  const pendingCount = pendingContent.length;

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Queue</h3>
          {pendingCount > 0 && (
            <Badge variant="warning" className="font-medium">
              {pendingCount} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pendingContent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No pending content for review.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">AI-generated content will appear here for approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingContent.slice(0, 3).map((content) => (
              <div
                key={content.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Reply to @{content.targetTweetId?.split('_')[0] || 'user'}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => approveContentMutation.mutate(content.id)}
                      disabled={approveContentMutation.isPending}
                      className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rejectContentMutation.mutate(content.id)}
                      disabled={rejectContentMutation.isPending}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-2">"{content.content}"</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Star className="mr-1 h-3 w-3" />
                  <span>Quality Score: {content.qualityScore?.toFixed(1) || 'N/A'}/10</span>
                </div>
              </div>
            ))}
            
            {pendingContent.length > 3 && (
              <Button variant="outline" className="w-full font-medium">
                Review All Pending ({pendingContent.length - 3} more)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
