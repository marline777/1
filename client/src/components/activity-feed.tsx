import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities?: Array<{
    id: number;
    type: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityDetails = (type: string) => {
    switch (type) {
      case "tweet_scraped":
        return { icon: "🔍", label: "Data Collection", description: "Found trending crypto tweet" };
      case "ai_content_generated":
        return { icon: "🤖", label: "AI Reply Created", description: "Generated follower-attracting response" };
      case "reply_posted":
        return { icon: "📤", label: "Reply Posted", description: "Successfully posted to Twitter" };
      case "twitter_workflow_completed":
        return { icon: "✅", label: "Workflow Complete", description: "Found and processed trending tweets" };
      case "proxy_rotated":
        return { icon: "🔄", label: "Proxy Switch", description: "Changed IP to avoid detection" };
      case "meme_created":
        return { icon: "🖼️", label: "Meme Generated", description: "Created viral content image" };
      case "workflow_started":
        return { icon: "▶️", label: "Automation Started", description: "Began monitoring for content" };
      case "workflow_stopped":
        return { icon: "⏹️", label: "Automation Stopped", description: "Workflow paused or completed" };
      case "twitter_reply_generated":
        return { icon: "💬", label: "Reply Ready", description: "AI created response awaiting approval" };
      case "system":
        return { icon: "⚙️", label: "System Update", description: "Internal system operation" };
      default:
        return { icon: "📊", label: "Activity", description: "System operation completed" };
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Operations</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time automation progress and results</p>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No operations running</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start a workflow to see automation progress here</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.map((activity) => {
              const details = getActivityDetails(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-l-blue-400"
                >
                  <div className="text-2xl">{details.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {details.label}
                      </h4>
                      <Badge 
                        variant={activity.status === "success" ? "success" : activity.status === "error" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {details.description}
                    </p>
                    <p className="text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 p-2 rounded">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
