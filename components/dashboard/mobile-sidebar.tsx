"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bot, LogOut, X } from "lucide-react";
import { sidebarNavItems } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ open, onClose }: MobileSidebarProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 w-full md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "ml-auto flex h-full w-[20rem] max-w-[85vw] flex-col border-l border-white/10 bg-gradient-to-b from-white/95 via-white/90 to-white/95 p-4 text-slate-600 shadow-2xl shadow-slate-900/30 backdrop-blur-2xl transition-transform duration-300 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 dark:text-slate-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <Bot className="h-5 w-5 text-sky-500 dark:text-sky-300" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              AI Monitor
            </span>
          </div>
        <button
          onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/50 bg-white/60 text-slate-500 shadow-sm transition hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-800/60"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium backdrop-blur-lg transition",
                  active
                    ? "border-sky-200/60 bg-gradient-to-r from-sky-50/70 via-white/80 to-white/40 text-sky-600 shadow-md dark:border-slate-700 dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-900/20 dark:text-sky-200"
                    : "border-white/20 text-slate-600 hover:border-white/50 hover:bg-white/40 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/30 dark:hover:bg-slate-800/40",
                )}
              >
                <span className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-slate-700 dark:bg-slate-800/80 dark:text-slate-100",
                  active && "bg-sky-500/10 text-sky-500 dark:bg-sky-400/20 dark:text-sky-200"
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate">{item.label}</p>
                    {item.badge === "action" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-600 dark:text-sky-300">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.helper}</p>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-2 border-t border-white/20 pt-4 dark:border-white/10">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-white/40 bg-white/60 text-slate-700 hover:bg-white/80 dark:border-white/10 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800/80"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

