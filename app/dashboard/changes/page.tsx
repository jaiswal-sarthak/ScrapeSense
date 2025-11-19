/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { ChangeFeed } from "@/components/dashboard/change-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Calendar } from "lucide-react";

export default async function ChangesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  const changes = await db.getChangeLogs(session.user.id).catch((error) => {
    console.error("Failed to load change logs", error);
    return [];
  });

  // Calculate stats
  const now = new Date().getTime();
  const totalChanges = changes.length;
  const last24h = now - 24 * 60 * 60 * 1000;
  const recentChanges = changes.filter((c: any) => 
    new Date(c.created_at).getTime() > last24h
  ).length;
  const last7days = now - 7 * 24 * 60 * 60 * 1000;
  const weeklyChanges = changes.filter((c: any) => 
    new Date(c.created_at).getTime() > last7days
  ).length;

  return (
    <div className="space-y-6">
      {/* Change Analytics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalChanges}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time detected</p>
          </CardContent>
        </Card>
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 24 Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{recentChanges}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
          </CardContent>
        </Card>
        <Card className="border-white/20 hover:scale-[1.02] transition-transform">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-500" />
              <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">{weeklyChanges}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Change Feed */}
      <ChangeFeed changes={changes as any} />
    </div>
  );
}

