import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { TaskTable } from "@/components/dashboard/task-table";
import { ChangeFeed } from "@/components/dashboard/change-feed";
import { SummaryPanel } from "@/components/dashboard/summary-panel";
import { ScrapeHealth } from "@/components/dashboard/scrape-health";
import { CronCard } from "@/components/dashboard/cron-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { StatsChart } from "@/components/dashboard/stats-chart";
import { NotificationStatus } from "@/components/dashboard/notification-status";
import { AnalyticsSummary } from "@/components/dashboard/analytics-summary";

interface DashboardTask {
  id: string;
  instruction_text: string;
  schedule_interval_hours: number;
  ai_generated_schema: Record<string, unknown> | null;
  site: {
    id: string;
    url: string;
    title?: string | null;
    last_health_status?: "healthy" | "degraded" | "failed" | "unknown" | null;
  } | {
    id: string;
    url: string;
    title?: string | null;
    last_health_status?: "healthy" | "degraded" | "failed" | "unknown" | null;
  }[] | null;
  last_run?: {
    run_status?: string | null;
    run_time?: string | null;
    error_message?: string | null;
  }[] | null;
}

const resolveStatus = (
  status?: string | null,
): "healthy" | "degraded" | "failed" | "unknown" => {
  if (status === "healthy" || status === "degraded" || status === "failed" || status === "unknown") {
    return status;
  }
  return "unknown";
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  const [rawTasks, changes, results, settings] = await Promise.all([
    db.getDashboardData(session.user.id).catch((error) => {
      console.error("Failed to load dashboard data", error);
      return [];
    }),
    db.getChangeLogs(session.user.id).catch(() => []),
    db.getResults(session.user.id).catch(() => []),
    db.getSettings(session.user.id).catch(() => null),
  ]);

  // Normalize tasks to handle Supabase array returns
  const tasks = rawTasks.map((t: any) => ({
    ...t,
    site: Array.isArray(t.site) ? t.site[0] : t.site,
    last_run: Array.isArray(t.last_run) ? t.last_run[0] : t.last_run,
  }));

  const totalSites = new Set(tasks.map((task: any) => task.site?.id).filter(Boolean)).size;
  const lastRun = tasks.reduce<string | undefined>((latest: string | undefined, task: any) => {
    const current = task.last_run?.run_time;
    if (!current) return latest;
    if (!latest || new Date(current) > new Date(latest)) {
      return current;
    }
    return latest;
  }, undefined);

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <OverviewCards
        totalTasks={tasks.length}
        totalSites={totalSites}
        lastRun={lastRun}
        pendingAlerts={0}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Analytics Row */}
      <StatsChart tasks={tasks} results={results} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Tasks & Changes */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <TaskTable tasks={tasks} />
          <ActivityFeed tasks={tasks} changes={changes} />
        </div>

        {/* Right Column - Insights & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <NotificationStatus
            hasEmail={!!settings?.notification_email}
            hasTelegram={!!settings?.telegram_chat_id}
          />
          <AnalyticsSummary />
          <SummaryPanel
            summary={changes[0]?.new_value ? JSON.stringify(changes[0].new_value) : undefined}
            results={results as any}
          />
          <ScrapeHealth
            items={tasks.map((task: any) => ({
              id: task.id,
              site: task.site?.title ?? task.site?.url ?? "Unknown site",
              status: resolveStatus(task.site?.last_health_status),
              lastRun: task.last_run?.run_time ?? undefined,
            }))}
          />
          <CronCard />
        </div>
      </div>

      {/* Recent Changes Feed */}
      <ChangeFeed changes={changes.slice(0, 5) as any} />
    </div>
  );
}

