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

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "tweet_scraped":
        return "Tweet scraped";
      case "ai_content_generated":
        return "AI Response generated";
      case "proxy_rotated":
        return "Proxy rotated";
      case "reply_posted":
        return "Reply posted";
      case "meme_created":
        return "Meme generated";
      case "workflow_started":
        return "Workflow started";
      case "workflow_stopped":
        return "Workflow stopped";
      case "system":
        return "System";
      default:
        return "Activity";
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Activity will appear here once workflows are running.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <strong>{getActivityTypeLabel(activity.type)}:</strong> {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
