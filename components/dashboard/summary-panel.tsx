import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface SummaryPanelProps {
  summary?: string;
  results?: Array<{
    title: string;
    ai_summary?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
}

export const SummaryPanel = ({ summary, results }: SummaryPanelProps) => {
  // Extract insights from results
  const totalResults = results?.length ?? 0;
  const withAI = results?.filter(r => r.ai_summary && r.ai_summary !== "Awaiting AI summary").length ?? 0;

  // Get top items based on metadata (e.g., upvotes)
  const topItems = results
    ?.filter(r => r.metadata?.upvotes)
    ?.sort((a, b) => {
      const aVotes = parseInt(String(a.metadata?.upvotes || "0").replace(/\D/g, "")) || 0;
      const bVotes = parseInt(String(b.metadata?.upvotes || "0").replace(/\D/g, "")) || 0;
      return bVotes - aVotes;
    })
    ?.slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-fuchsia-300" />
          </div>
          <CardTitle>AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalResults > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 rounded-lg p-3 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Items</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalResults}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
                <p className="text-xs text-slate-600 dark:text-slate-400">AI Processed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{withAI}</p>
              </div>
            </div>

            {/* Top Items */}
            {topItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <TrendingUp className="w-4 h-4" />
                  <span>Top Trending</span>
                </div>
                {topItems.map((item, i) => (
                  <div key={i} className="bg-white/50 rounded-lg p-2.5 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
                    <p className="text-sm font-medium line-clamp-1 text-slate-900 dark:text-white">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.metadata?.upvotes ? `${item.metadata.upvotes}` : '0'} votes
                      </Badge>
                      {item.metadata?.tagline ? (
                        <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          {String(item.metadata.tagline)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Summary */}
            {summary && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 dark:bg-sky-400/10 dark:border-sky-400/20">
                <p className="text-sm text-slate-700 dark:text-slate-200">{summary}</p>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <AlertCircle className="w-4 h-4" />
                <span>Recommendations</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Monitor trending items for market insights</li>
                <li>Set up alerts for high-engagement content</li>
                {withAI < totalResults && (
                  <li className="text-amber-600 dark:text-amber-400">
                    {totalResults - withAI} items pending AI analysis
                  </li>
                )}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Once Groq processes your scraped data you&apos;ll see prioritized highlights, leading indicators, and recommended follow-ups here.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
