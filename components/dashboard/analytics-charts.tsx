"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalTasks: number;
    totalResults: number;
    totalChanges: number;
    activeSites: number;
  };
  successRate: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  trendData: Array<{ date: string; results: number; changes: number }>;
  topSites: Array<{ name: string; count: number; status: string }>;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export const AnalyticsCharts = () => {
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
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Failed to load analytics data
        </CardContent>
      </Card>
    );
  }

  const timeData = [
    { period: "Night", count: data.timeDistribution.night, color: "#8b5cf6" },
    { period: "Morning", count: data.timeDistribution.morning, color: "#f59e0b" },
    { period: "Afternoon", count: data.timeDistribution.afternoon, color: "#0ea5e9" },
    { period: "Evening", count: data.timeDistribution.evening, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Success Rate */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Success Rate</CardTitle>
              <CardDescription>Scraping performance overview</CardDescription>
            </div>
            <Badge
              variant={data.successRate.rate >= 80 ? "success" : data.successRate.rate >= 50 ? "warning" : "danger"}
              className="text-lg px-3 py-1"
            >
              {data.successRate.rate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Successful</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {data.successRate.successful}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs font-medium">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {data.successRate.failed}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Total Runs</span>
              </div>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {data.successRate.total}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Trend</CardTitle>
          <CardDescription>Results and changes over the last week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="results"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Results"
                dot={{ fill: "#0ea5e9", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="changes"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Changes"
                dot={{ fill: "#8b5cf6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sites & Time Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Sites</CardTitle>
            <CardDescription>Most active monitoring targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topSites} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Activity Times</CardTitle>
            <CardDescription>When results are scraped</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const percent = props.percent || 0;
                    const period = props.payload?.period || "";
                    if (percent > 0) {
                      return `${period} ${(percent * 100).toFixed(0)}%`;
                    }
                    return "";
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {timeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {item.period}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

