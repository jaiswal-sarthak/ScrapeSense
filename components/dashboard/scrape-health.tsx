import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Health {
  id: string;
  site: string;
  status: "healthy" | "degraded" | "failed" | "unknown";
  lastRun?: string;
}

const statusCopy: Record<Health["status"], string> = {
  healthy: "Operating normally",
  degraded: "Minor issues",
  failed: "Action required",
  unknown: "No data",
};

export const ScrapeHealth = ({ items }: { items: Health[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraping health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/30 bg-white/50 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{item.site}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {statusCopy[item.status]} {item.lastRun ? `• Last run ${item.lastRun}` : ""}
              </p>
            </div>
            <Badge
              variant={
                item.status === "healthy"
                  ? "success"
                  : item.status === "failed"
                    ? "danger"
                    : item.status === "degraded"
                      ? "warning"
                      : "secondary"
              }
              className="shrink-0"
            >
              {item.status}
            </Badge>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Health checks will appear after your first cron run.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

