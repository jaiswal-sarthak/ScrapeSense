"use client";

import { useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CronCard = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const triggerRun = async () => {
    setIsRunning(true);
    setStatus(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Failed to trigger run");
      }
      setStatus("Manual run triggered. Check job history shortly.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual scrape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Need faster validation? Trigger the Playwright pipeline immediately.
        </p>
        <Button className="gap-2 w-full sm:w-auto" onClick={triggerRun} disabled={isRunning}>
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Run now
        </Button>
        {status && (
          <p className="text-xs text-slate-600 dark:text-slate-400 p-2 bg-white/50 rounded-lg border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
            {status}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

