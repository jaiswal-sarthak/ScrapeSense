"use client";

import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TopNavProps {
  user: { name?: string | null; email?: string | null };
  onToggleSidebar?: () => void;
}

type NotificationState = "idle" | "requesting" | "ready" | "blocked" | "unsupported";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const NotificationButton = () => {
  const [state, setState] = useState<NotificationState>("idle");

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("unsupported");
      return;
    }
    const permission = Notification.permission;
    const nextState: NotificationState =
      permission === "granted" ? "ready" : permission === "denied" ? "blocked" : "idle";
    setState(nextState);
  }, []);

  const handleClick = async () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      new Notification("AI Monitor", {
        body: "You'll now receive live browser alerts for scraper events.",
        icon: "/globe.svg",
      });
      setState("ready");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }
    setState("requesting");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("AI Monitor", {
        body: "Awesome — alerts are now active.",
        icon: "/globe.svg",
      });
      setState("ready");
    } else {
      setState(permission === "denied" ? "blocked" : "idle");
    }
  };

  const label = useMemo(() => {
    switch (state) {
      case "ready":
        return "Browser alerts on";
      case "blocked":
        return "Enable in browser settings";
      case "unsupported":
        return "Notifications unavailable";
      case "requesting":
        return "Enabling alerts…";
      default:
        return "Enable browser alerts";
    }
  }, [state]);

  return (
    <button
      onClick={handleClick}
      disabled={state === "blocked" || state === "unsupported" || state === "requesting"}
      className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-white/50 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg hover:shadow-white/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:shadow-slate-900/60"
      aria-live="polite"
    >
      {state === "ready" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : state === "requesting" ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-500 dark:text-slate-300" />
      ) : (
        <BellRing className="h-4 w-4 text-slate-500 transition group-hover:text-slate-700 dark:text-slate-300 dark:group-hover:text-white" />
      )}
      {label}
    </button>
  );
};

export const TopNav = ({ user, onToggleSidebar }: TopNavProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/20 bg-white/80 py-4 md:py-5 text-slate-700 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/5 dark:bg-slate-950/50 dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex items-start justify-between gap-3 md:gap-4">
      <button
        onClick={onToggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-700 shadow-sm shadow-slate-900/10 transition hover:border-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-white md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
          <div className="flex flex-1 min-w-0 flex-col">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-500 dark:text-slate-400">
                {getGreeting()}
              </p>
            <h2 className="text-base md:text-xl font-semibold text-slate-900 dark:text-white truncate">
                Welcome back, {user.name ?? user.email ?? "operator"}
              </h2>
            <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
                Live scraping, schema regeneration, and change detection at a glance.
              </p>
          </div>
          <div className="flex shrink-0 items-start gap-2 md:gap-3">
            <div className="hidden sm:block">
            <NotificationButton />
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex rounded-full border-white/40 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

