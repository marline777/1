import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SafetyControlsProps {
  settings?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
}

export default function SafetyControls({ settings = [] }: SafetyControlsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiRequest("PATCH", `/api/settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Setting Updated",
        description: "Safety control setting has been updated successfully.",
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

  const getSetting = (key: string, defaultValue: string = "false") => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const handleToggle = (key: string, currentValue: boolean) => {
    updateSettingMutation.mutate({
      key,
      value: (!currentValue).toString()
    });
  };

  const rateLimitEnabled = getSetting("rate_limiting_enabled") === "true";
  const captchaDetectionEnabled = getSetting("captcha_detection_enabled") === "true";
  const manualApprovalEnabled = getSetting("manual_approval_enabled") === "true";
  const dailyLimit = parseInt(getSetting("daily_post_limit", "200"));
  const dailyUsed = parseInt(getSetting("daily_posts_used", "127"));

  const dailyLimitPercentage = dailyLimit > 0 ? (dailyUsed / dailyLimit) * 100 : 0;

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Controls</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Rate Limiting</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Max 5 replies/hour</p>
          </div>
          <Switch
            checked={rateLimitEnabled}
            onCheckedChange={() => handleToggle("rate_limiting_enabled", rateLimitEnabled)}
            disabled={updateSettingMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">CAPTCHA Detection</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Auto-solve enabled</p>
          </div>
          <Switch
            checked={captchaDetectionEnabled}
            onCheckedChange={() => handleToggle("captcha_detection_enabled", captchaDetectionEnabled)}
            disabled={updateSettingMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Manual Approval</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Review before posting</p>
          </div>
          <Switch
            checked={manualApprovalEnabled}
            onCheckedChange={() => handleToggle("manual_approval_enabled", manualApprovalEnabled)}
            disabled={updateSettingMutation.isPending}
          />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Daily Limits</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {dailyUsed}/{dailyLimit}
            </span>
          </div>
          <Progress value={dailyLimitPercentage} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
