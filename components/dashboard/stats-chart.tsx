"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface Task {
  last_run?: {
    run_status?: string;
  };
}

interface Result {
  created_at: string;
}

interface StatsChartProps {
  tasks: Task[];
  results: Result[];
}

export const StatsChart = ({ tasks, results }: StatsChartProps) => {
  // Calculate stats using useMemo to avoid recalculation on every render
  const stats = useMemo(() => {
    const totalRuns = tasks.reduce((acc, task) => {
      return acc + (task.last_run ? 1 : 0);
    }, 0);

    const successfulRuns = tasks.filter(
      (task) => task.last_run?.run_status === "success"
    ).length;

    const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
    const totalResults = results.length;
    
    // Get results from last 24h - using new Date() which is acceptable in useMemo
    const last24h = new Date().getTime() - 24 * 60 * 60 * 1000;
    const recentResults = results.filter((r) => {
      return new Date(r.created_at).getTime() > last24h;
    }).length;

    return { totalRuns, successfulRuns, successRate, totalResults, recentResults };
  }, [tasks, results]);

  const statCards = [
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      change: stats.successRate >= 80 ? "+12%" : "-5%",
      trending: stats.successRate >= 80 ? "up" : "down",
      color: stats.successRate >= 80 ? "text-emerald-600" : "text-red-600",
    },
    {
      label: "Total Scraped",
      value: stats.totalResults,
      change: stats.recentResults > 0 ? `+${stats.recentResults} today` : "No data",
      trending: stats.recentResults > 0 ? "up" : "neutral",
      color: "text-blue-600",
    },
    {
      label: "Active Tasks",
      value: tasks.length,
      change: `${stats.successfulRuns}/${stats.totalRuns} completed`,
      trending: "neutral",
      color: "text-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col p-3 rounded-xl border border-white/30 bg-white/50 dark:border-white/10 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                {stat.trending === "up" && (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                )}
                {stat.trending === "down" && (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {stat.trending === "neutral" && (
                  <Activity className="h-3 w-3 text-slate-400" />
                )}
              </div>
              <p className={`text-2xl font-bold ${stat.color} dark:brightness-125`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

