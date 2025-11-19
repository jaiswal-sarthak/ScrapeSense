"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Play, ExternalLink, Edit, TrendingUp, RefreshCw, Trash2 } from "lucide-react";

interface Task {
  id: string;
  instruction_text: string;
  schedule_interval_hours: number;
  ai_generated_schema: Record<string, unknown> | null;
  site: {
    id: string;
    url: string;
    title?: string | null;
    last_health_status?: string | null;
  } | null;
  last_run?: {
    run_status?: string;
    run_time?: string;
    error_message?: string;
  } | null;
  results?: { count: number }[];
}

export const TaskTable = ({ tasks }: { tasks: Task[] }) => {
  const router = useRouter();
  const [scraping, setScraping] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const handleRunScrape = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScraping(taskId);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: taskId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Scrape failed");
      }
    } catch (error) {
      console.error("Scrape error:", error);
    } finally {
      setScraping(null);
    }
  };

  const handleDelete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this instruction? This will also delete all scraped results.")) {
      return;
    }

    setDeleting(taskId);

    try {
      const response = await fetch(`/api/instructions/delete?id=${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete instruction");
    } finally {
      setDeleting(null);
    }
  };

  const handleRegenerate = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Regenerate schema by inspecting the page? This will update the selectors.")) {
      return;
    }

    setRegenerating(taskId);

    try {
      const response = await fetch("/api/regenerate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionId: taskId }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Schema regenerated successfully!\nFound patterns: ${data.patterns?.dataTestAttributes?.length || 0} data-test attributes`);
        router.refresh();
      } else {
        // Try to parse error message, but handle empty responses
        let errorMessage = "Unknown error";
        try {
          const data = await response.json();
          errorMessage = data.message || data.error || errorMessage;
        } catch {
          // Response body is empty or not JSON
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to regenerate: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Regenerate error:", error);
      alert(`Failed to regenerate schema: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setRegenerating(null);
    }
  };

  const handleViewResults = (taskId: string) => {
    router.push(`/dashboard/results?instruction=${taskId}`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getResultCount = (task: Task) => {
    return task.results?.[0]?.count ?? 0;
  };

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tracked Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const resultCount = getResultCount(task);
            const isRunning = scraping === task.id;
            const isDeleting = deleting === task.id;
            const isRegenerating = regenerating === task.id;

            return (
              <Card
                key={task.id}
                className="border-border/60 hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-lg group"
                onClick={() => handleViewResults(task.id)}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {task.site?.title ?? task.site?.url ?? "Unknown"}
                        </h3>
                        <Link
                          href={task.site?.url ?? "#"}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.instruction_text}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Results</p>
                      <p className="text-lg font-bold">{resultCount}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Interval</p>
                      <p className="text-lg font-bold">{task.schedule_interval_hours}h</p>
                    </div>
                  </div>

                  {/* Status & Last Run */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-muted-foreground">
                      {task.last_run?.run_time ? formatDate(task.last_run.run_time) : "Never run"}
                    </span>
                    <Badge
                      className={`text-xs ${getStatusColor(task.last_run?.run_status)}`}
                      variant="outline"
                    >
                      {task.last_run?.run_status ?? "pending"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-[100px]"
                      onClick={(e) => handleRunScrape(task.id, e)}
                      disabled={isRunning || isDeleting}
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Run Now
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-9 w-9 p-0"
                      onClick={(e) => handleRegenerate(task.id, e)}
                      disabled={isRegenerating || isDeleting}
                      title="Regenerate schema by inspecting page"
                    >
                      {isRegenerating ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-9 w-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/tasks?edit=${task.id}`);
                      }}
                      disabled={isDeleting}
                      title="Edit instruction"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                      onClick={(e) => handleDelete(task.id, e)}
                      disabled={isDeleting}
                      title="Delete instruction"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      )}
                    </Button>
                  </div>

                  {/* Result Preview */}
                  {resultCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <TrendingUp className="w-3 h-3" />
                        <span>Click to view {resultCount} results</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No instructions yet. Create your first task to start monitoring.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
