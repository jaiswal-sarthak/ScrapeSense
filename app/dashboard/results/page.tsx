/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { ResultTable } from "@/components/dashboard/result-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";
import { ExportButtons } from "@/components/dashboard/export-buttons";

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  const [results, instructions] = await Promise.all([
    db.getResults(session.user.id).catch((error) => {
      console.error("Failed to load results", error);
      return [];
    }),
    db.getDashboardData(session.user.id).catch((error) => {
      console.error("Failed to load instructions", error);
      return [];
    }),
  ]);

  // Group results by instruction
  const groupedResults = instructions.map((instruction) => {
    const site = Array.isArray(instruction.site) ? instruction.site[0] : instruction.site;
    const lastRun = Array.isArray(instruction.last_run) ? instruction.last_run[0] : instruction.last_run;
    const instructionResults = results.filter(
      (r: any) => r.instruction?.id === instruction.id
    );
    return {
      instruction: { ...instruction, site, last_run: lastRun },
      results: instructionResults,
    };
  });

  const hasResults = groupedResults.some(g => g.results.length > 0);
  const hasFailures = groupedResults.some(g => g.instruction.last_run?.run_status === 'failed' && g.results.length === 0);
  const totalResults = results.length;
  const successfulTasks = groupedResults.filter(g => g.results.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scraped Results</h1>
        <ExportButtons />
      </div>

      {/* Results Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalResults}</div>
            <p className="text-xs text-muted-foreground mt-1">Items scraped</p>
          </CardContent>
        </Card>
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {successfulTasks}/{groupedResults.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">With results</p>
          </CardContent>
        </Card>
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/dashboard/tasks/new" className="flex-1">
              <button className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-300 transition flex items-center justify-center gap-1">
                <Plus className="h-3 w-3" />
                New Task
              </button>
            </Link>
            <Link href="/dashboard/changes" className="flex-1">
              <button className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-300 transition flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Changes
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Results by Task */}
      {groupedResults.map((group) => {
        const lastRun = group.instruction.last_run;
        const isFailed = lastRun?.run_status === 'failed';
        const hasResults = group.results.length > 0;

        return (
          <Card key={group.instruction.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
              <CardTitle className="text-lg">
                {group.instruction.site?.title || group.instruction.site?.url || "Unknown Site"}
              </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {group.instruction.instruction_text}
              </p>
                </div>
                {lastRun && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    Last run: {new Date(lastRun.run_time).toLocaleString()}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isFailed && !hasResults && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <p className="font-medium text-sm mb-2">⚠️ Scrape Failed</p>
                  <p className="text-xs mb-3">{lastRun.error_message || 'Unknown error occurred'}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    💡 Try clicking &quot;Regenerate Schema&quot; in the Overview page to update the selectors.
                  </p>
                </div>
              )}
              {hasResults ? (
              <ResultTable results={group.results} showHeader={false} />
              ) : !isFailed && (
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">
                  No results yet. Run the scrape from the New Task page.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!hasResults && !hasFailures && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No results yet. Create a task and run a scrape to see data here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

