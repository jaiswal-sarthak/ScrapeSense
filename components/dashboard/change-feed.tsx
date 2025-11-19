import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ChangeLog {
  id: string;
  change_type: string;
  created_at: string;
  result?: {
    title?: string;
    url?: string;
  };
  new_value?: Record<string, unknown> | null;
}

export const ChangeFeed = ({ changes }: { changes: ChangeLog[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {changes.map((change) => (
          <div key={change.id} className="rounded-xl border border-white/30 bg-white/50 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40">
            <div className="flex items-start justify-between gap-2 text-sm">
              <span className="font-medium line-clamp-1">{change.result?.title ?? "Result updated"}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{formatDate(change.created_at)}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
              {change.change_type} • {change.result?.url}
            </p>
          </div>
        ))}
        {changes.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No change logs recorded yet. Once scrapes run twice we&apos;ll highlight deltas here.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

