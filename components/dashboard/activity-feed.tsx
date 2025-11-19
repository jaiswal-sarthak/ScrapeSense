/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  type: "scrape" | "change" | "error" | "schema";
  message: string;
  timestamp: string;
  status?: "success" | "failed" | "pending";
  site?: string;
}

export const ActivityFeed = ({ tasks, changes }: { tasks: any[]; changes: any[] }) => {
  // Build activity feed from tasks and changes
  const activities: Activity[] = [];

  // Add recent scrapes
  tasks.forEach((task: any) => {
    if (task.last_run?.run_time) {
      activities.push({
        id: `scrape-${task.id}`,
        type: task.last_run.run_status === "success" ? "scrape" : "error",
        message: task.last_run.run_status === "success" 
          ? `Scraped ${task.site?.title || "site"}` 
          : `Failed to scrape ${task.site?.title || "site"}`,
        timestamp: task.last_run.run_time,
        status: task.last_run.run_status === "success" ? "success" : "failed",
        site: task.site?.title || task.site?.url,
      });
    }
  });

  // Add recent changes
  changes.slice(0, 5).forEach((change: any) => {
    activities.push({
      id: `change-${change.id}`,
      type: "change",
      message: `Detected change in ${change.result?.title || "data"}`,
      timestamp: change.created_at,
      status: "success",
    });
  });

  // Sort by timestamp (most recent first)
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const getIcon = (activity: Activity) => {
    switch (activity.type) {
      case "scrape":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "change":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-slate-800/80">
                  {getIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white line-clamp-1">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(activity.timestamp)}
                    </p>
                    {activity.status && (
                      <Badge
                        variant={activity.status === "success" ? "success" : "danger"}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-slate-600 dark:text-slate-400 py-8">
              No activity yet. Create a task to get started!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

