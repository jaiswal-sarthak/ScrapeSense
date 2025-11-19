"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { BellRing, Rocket, Satellite, Sparkles } from "lucide-react";

interface OverviewProps {
  totalTasks: number;
  totalSites: number;
  lastRun?: string;
  pendingAlerts: number;
}

const iconTone = {
  primary: "from-sky-500/20 to-blue-500/10 text-sky-600 dark:text-sky-300",
  purple: "from-purple-500/20 to-fuchsia-500/10 text-purple-600 dark:text-fuchsia-300",
  amber: "from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-300",
  emerald: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-300",
};

export const OverviewCards = ({ totalTasks, totalSites, lastRun, pendingAlerts }: OverviewProps) => {
  const metrics = [
    {
      title: "Active instructions",
      value: totalTasks,
      helper: "Across all tracked properties",
      icon: Rocket,
      tone: iconTone.primary,
      href: "/dashboard/tasks/new",
    },
    {
      title: "Monitored sites",
      value: totalSites,
      helper: "Isolated per root domain",
      icon: Satellite,
      tone: iconTone.purple,
      href: "/dashboard",
    },
    {
      title: "Last scrape",
      value: lastRun ? formatDate(lastRun) : "No runs yet",
      helper: "Updated via Vercel Cron",
      icon: Sparkles,
      tone: iconTone.amber,
      href: "/dashboard/results",
    },
    {
      title: "Alerts queued",
      value: pendingAlerts,
      helper: "Browser, Telegram & Email",
      icon: BellRing,
      tone: iconTone.emerald,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Link key={metric.title} href={metric.href}>
            <Card className="overflow-hidden border-white/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
              <CardHeader className="relative pb-4">
              <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ${metric.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
                <CardDescription className="text-[10px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                {metric.title}
              </CardDescription>
                <CardTitle className="text-2xl font-bold">{metric.value}</CardTitle>
            </CardHeader>
              <CardContent className="pt-0 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {metric.helper}
            </CardContent>
          </Card>
          </Link>
        );
      })}
    </div>
  );
};

