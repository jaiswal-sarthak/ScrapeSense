"use client";

import Link from "next/link";
import { Plus, Play, TrendingUp, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      label: "New Task",
      description: "Create scraping task",
      href: "/dashboard/tasks/new",
      color: "from-sky-500/20 to-blue-500/10 text-sky-600 dark:text-sky-300",
    },
    {
      icon: TrendingUp,
      label: "Results",
      description: "View scraped data",
      href: "/dashboard/results",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-300",
    },
    {
      icon: Play,
      label: "Run All",
      description: "Start all tasks",
      href: "/dashboard/tasks/new",
      color: "from-purple-500/20 to-fuchsia-500/10 text-purple-600 dark:text-fuchsia-300",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Configure alerts",
      href: "/dashboard/settings",
      color: "from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-300",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/30 bg-white/50 hover:bg-white/70 transition backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40 dark:hover:bg-slate-800/60"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

