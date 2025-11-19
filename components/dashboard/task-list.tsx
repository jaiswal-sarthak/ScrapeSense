"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  instruction_text: string;
  schedule_interval_hours: number;
  site?: {
    url: string;
    title?: string | null;
  };
  last_run?: {
    run_status?: string | null;
    run_time?: string | null;
  };
}

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const router = useRouter();
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [regeneratingTasks, setRegeneratingTasks] = useState<Set<string>>(new Set());
  const [taskStatus, setTaskStatus] = useState<Record<string, { type: "success" | "error"; message: string }>>({});

  const handleRunTask = async (taskId: string) => {
    setRunningTasks(prev => new Set(prev).add(taskId));
    setTaskStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[taskId];
      return newStatus;
    });

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to run scrape");
      }

      setTaskStatus(prev => ({
        ...prev,
        [taskId]: {
          type: "success",
          message: "Scrape completed! Check the Results page.",
        },
      }));

      // Refresh after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      setTaskStatus(prev => ({
        ...prev,
        [taskId]: {
          type: "error",
          message: error instanceof Error ? error.message : "Failed to run scrape",
        },
      }));
    } finally {
      setRunningTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleRegenerateSchema = async (taskId: string) => {
    setRegeneratingTasks(prev => new Set(prev).add(taskId));
    setTaskStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[taskId];
      return newStatus;
    });

    try {
      const res = await fetch("/api/regenerate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: taskId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to regenerate schema");
      }

      setTaskStatus(prev => ({
        ...prev,
        [taskId]: {
          type: "success",
          message: "Schema regenerated! Try running the scrape again.",
        },
      }));

      router.refresh();
    } catch (error) {
      setTaskStatus(prev => ({
        ...prev,
        [taskId]: {
          type: "error",
          message: error instanceof Error ? error.message : "Failed to regenerate schema",
        },
      }));
    } finally {
      setRegeneratingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  // Sort by last run time (most recent first)
  // Newly created tasks (without last_run) appear at the top
  const sortedTasks = [...tasks].sort((a, b) => {
    const aTime = a.last_run?.run_time ? new Date(a.last_run.run_time).getTime() : Date.now();
    const bTime = b.last_run?.run_time ? new Date(b.last_run.run_time).getTime() : Date.now();
    return bTime - aTime;
  });

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {sortedTasks.map((task) => {
        const isRunning = runningTasks.has(task.id);
        const isRegenerating = regeneratingTasks.has(task.id);
        const status = taskStatus[task.id];
        const lastRunFailed = task.last_run?.run_status === 'failed';

        return (
          <div
            key={task.id}
            className="rounded-xl border border-white/30 bg-white/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {task.site?.title || task.site?.url || "Unknown site"}
                  </h3>
                  {task.site?.url && (
                    <a
                      href={task.site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {lastRunFailed && (
                    <Badge variant="danger" className="text-xs">
                      Failed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                  {task.instruction_text}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge variant="secondary" className="text-xs">
                    Every {task.schedule_interval_hours}h
                  </Badge>
                  {task.last_run?.run_time && (
                    <span>Last run: {new Date(task.last_run.run_time).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {lastRunFailed && (
                  <Button
                    onClick={() => handleRegenerateSchema(task.id)}
                    disabled={isRegenerating}
                    variant="outline"
                    className="gap-2"
                    size="sm"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Fix Schema
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => handleRunTask(task.id)}
                  disabled={isRunning}
                  className="gap-2"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            </div>

            {status && (
              <div
                className={`mt-3 flex items-start gap-2 rounded-lg border p-2 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {status.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
                <p className="text-xs">{status.message}</p>
              </div>
            )}
          </div>
        );
      })}
      </div>
      
      {sortedTasks.length === 0 && (
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 py-8">
          No tasks yet. Create your first scraping task above!
        </p>
      )}
    </div>
  );
};

