/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [tasks, results, changes] = await Promise.all([
      db.getDashboardData(session.user.id).catch(() => []),
      db.getResults(session.user.id).catch(() => []),
      db.getChangeLogs(session.user.id).catch(() => []),
    ]);

    // Normalize tasks
    const normalizedTasks = tasks.map((t: any) => ({
      ...t,
      site: Array.isArray(t.site) ? t.site[0] : t.site,
      last_run: Array.isArray(t.last_run) ? t.last_run[0] : t.last_run,
    }));

    // Calculate analytics
    const analytics = {
      overview: {
        totalTasks: normalizedTasks.length,
        totalResults: results.length,
        totalChanges: changes.length,
        activeSites: new Set(normalizedTasks.map((t: any) => t.site?.id).filter(Boolean)).size,
      },
      
      successRate: calculateSuccessRate(normalizedTasks),
      
      trendData: generateTrendData(results, changes),
      
      topSites: getTopSites(normalizedTasks, results),
      
      recentActivity: getRecentActivity(normalizedTasks, changes),
      
      timeDistribution: getTimeDistribution(results),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { message: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}

function calculateSuccessRate(tasks: any[]) {
  const totalRuns = tasks.filter((t) => t.last_run).length;
  const successfulRuns = tasks.filter((t) => t.last_run?.run_status === "success").length;
  const failedRuns = tasks.filter((t) => t.last_run?.run_status === "failed").length;
  
  return {
    total: totalRuns,
    successful: successfulRuns,
    failed: failedRuns,
    rate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0,
  };
}

function generateTrendData(results: any[], changes: any[]) {
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dayResults = results.filter((r: any) => {
      const created = new Date(r.created_at);
      return created >= date && created < nextDay;
    });
    
    const dayChanges = changes.filter((c: any) => {
      const created = new Date(c.created_at);
      return created >= date && created < nextDay;
    });
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      results: dayResults.length,
      changes: dayChanges.length,
    };
  });
}

function getTopSites(tasks: any[], results: any[]) {
  const siteStats = new Map<string, { name: string; count: number; status: string }>();
  
  tasks.forEach((task: any) => {
    const siteName = task.site?.title || task.site?.url || "Unknown";
    const siteId = task.site?.id || siteName;
    
    const taskResults = results.filter((r: any) => 
      r.instruction?.id === task.id
    ).length;
    
    if (siteStats.has(siteId)) {
      const current = siteStats.get(siteId)!;
      current.count += taskResults;
    } else {
      siteStats.set(siteId, {
        name: siteName,
        count: taskResults,
        status: task.last_run?.run_status || "pending",
      });
    }
  });
  
  return Array.from(siteStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getRecentActivity(tasks: any[], changes: any[]) {
  const activities: any[] = [];
  
  // Add recent scrapes
  tasks
    .filter((t: any) => t.last_run?.run_time)
    .sort((a: any, b: any) => 
      new Date(b.last_run.run_time).getTime() - new Date(a.last_run.run_time).getTime()
    )
    .slice(0, 5)
    .forEach((task: any) => {
      activities.push({
        type: task.last_run.run_status === "success" ? "scrape_success" : "scrape_failed",
        site: task.site?.title || task.site?.url || "Unknown",
        timestamp: task.last_run.run_time,
      });
    });
  
  // Add recent changes
  changes
    .slice(0, 5)
    .forEach((change: any) => {
      activities.push({
        type: "change_detected",
        site: change.result?.title || "Unknown",
        timestamp: change.created_at,
      });
    });
  
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

function getTimeDistribution(results: any[]) {
  const hours = Array(24).fill(0);
  
  results.forEach((r: any) => {
    const hour = new Date(r.created_at).getHours();
    hours[hour]++;
  });
  
  // Group into time periods
  return {
    morning: hours.slice(6, 12).reduce((a, b) => a + b, 0),
    afternoon: hours.slice(12, 18).reduce((a, b) => a + b, 0),
    evening: hours.slice(18, 24).reduce((a, b) => a + b, 0),
    night: hours.slice(0, 6).reduce((a, b) => a + b, 0),
  };
}

