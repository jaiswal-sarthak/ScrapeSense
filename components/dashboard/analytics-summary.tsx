"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, ArrowRight, Loader2 } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalTasks: number;
    totalResults: number;
    totalChanges: number;
    activeSites: number;
  };
  successRate: {
    rate: number;
  };
  trendData: Array<{ date: string; results: number; changes: number }>;
}

export const AnalyticsSummary = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      } else {
        console.error("Analytics API error:", response.status, response.statusText);
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Calculate trend direction
  const recentResults = data.trendData.slice(-3).reduce((sum, d) => sum + d.results, 0);
  const previousResults = data.trendData.slice(-6, -3).reduce((sum, d) => sum + d.results, 0);
  const trend = recentResults > previousResults ? "up" : recentResults < previousResults ? "down" : "stable";
  const trendPercent = previousResults > 0 
    ? Math.abs(Math.round(((recentResults - previousResults) / previousResults) * 100))
    : 0;

  return (
    <Card className="border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <CardTitle className="text-base">Quick Insights</CardTitle>
          </div>
          <Link href="/dashboard/analytics">
            <button className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 transition">
              View Full Analytics
              <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend Mini Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data.trendData}>
              <Line
                type="monotone"
                dataKey="results"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="absolute top-2 right-2">
            <Badge
              variant={trend === "up" ? "success" : trend === "down" ? "danger" : "secondary"}
              className="text-xs gap-1"
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {trend === "stable" ? "Stable" : `${trendPercent}%`}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {data.successRate.rate}%
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
            <p className="text-xs text-muted-foreground">Total Results</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {data.overview.totalResults}
            </p>
          </div>
        </div>

        {/* View Full Analytics Link */}
        <Link href="/dashboard/analytics">
          <button className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-white/70 border border-white/40 hover:bg-white transition dark:bg-slate-800/60 dark:border-white/10 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Full Analytics Dashboard
          </button>
        </Link>
      </CardContent>
    </Card>
  );
};

