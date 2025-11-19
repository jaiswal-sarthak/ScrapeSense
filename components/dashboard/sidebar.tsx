"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, ChartBar, Layers, Settings, Telescope, Plus } from "lucide-react";

export const sidebarNavItems = [
  { label: "Overview", href: "/dashboard", icon: Telescope, helper: "Dashboard & analytics", badge: null },
  { label: "New Task", href: "/dashboard/tasks/new", icon: Plus, helper: "Create scraping task", badge: "action" },
  { label: "Results", href: "/dashboard/results", icon: Layers, helper: "Scraped data", badge: null },
  { label: "Analytics", href: "/dashboard/analytics", icon: ChartBar, helper: "Trends & insights", badge: null },
  { label: "Changes", href: "/dashboard/changes", icon: Bot, helper: "Detected changes", badge: null },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, helper: "Alerts & config", badge: null },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar = ({ className, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative z-30 hidden md:flex min-h-screen w-64 flex-col border-r border-white/10 bg-white/60 px-3 py-5 text-sm text-slate-500 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl transition dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-300",
        className,
      )}
    >
        <div className="flex h-9 w-9 items-center justify-center">
          <Bot className="h-5 w-5 text-sky-500 dark:text-sky-300" />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex flex-col gap-1 rounded-2xl border border-transparent px-3 py-3 transition-all duration-200",
                active
                  ? "border-sky-200/60 bg-gradient-to-r from-sky-50/70 via-white/80 to-white/40 text-slate-900 shadow-lg shadow-sky-100/70 dark:border-slate-700 dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-900/20 dark:text-white dark:shadow-slate-900/60"
                  : "hover:border-white/30 hover:bg-white/40 hover:text-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/40 dark:hover:text-white",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700 shadow-sm shadow-slate-900/5 dark:bg-slate-800/90 dark:text-slate-100",
                    active && "bg-sky-500/10 text-sky-500 dark:bg-sky-400/20 dark:text-sky-200",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{item.label}</p>
                    {item.badge === "action" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-600 dark:text-sky-300">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.helper}</p>
                </div>
              </div>
              {active && (
                <span className="absolute inset-y-3 left-1 w-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 dark:from-sky-400/90 dark:to-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

