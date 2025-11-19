import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Track trends, performance, and activity patterns
          </p>
        </div>
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border hover:bg-accent transition">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </Link>
      </div>

      {/* Charts */}
      <AnalyticsCharts />
    </div>
  );
}

