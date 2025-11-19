/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Newspaper, MessageSquare, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { siteSchema, instructionSchema } from "@/lib/validators/task";

type CombinedForm = {
  url: string;
  title?: string;
  instructionText: string;
  scheduleIntervalHours: number;
};

const PRESET_SITES = [
  {
    icon: Code,
    name: "HackerNews",
    color: "from-orange-500/20 to-red-500/10 text-orange-600 dark:text-orange-300",
    config: {
      url: "https://news.ycombinator.com",
      title: "HackerNews — Top Stories",
      instructionText: "Fetch top tech stories and discussions from HackerNews with scores and comments",
      scheduleIntervalHours: 12,
    },
  },
  {
    icon: MessageSquare,
    name: "Reddit",
    color: "from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-300",
    config: {
      url: "https://reddit.com/r/programming",
      title: "Reddit — r/programming",
      instructionText: "Fetch hot posts from r/programming with upvotes and comments",
      scheduleIntervalHours: 6,
    },
  },
  {
    icon: Newspaper,
    name: "TechCrunch",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-300",
    config: {
      url: "https://techcrunch.com/feed/",
      title: "TechCrunch — Latest News",
      instructionText: "Fetch latest tech news articles from TechCrunch RSS feed",
      scheduleIntervalHours: 24,
    },
  },
];

export const TaskForm = () => {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CombinedForm>({
    resolver: zodResolver(
      siteSchema.merge(instructionSchema.pick({ 
        instructionText: true, 
        scheduleIntervalHours: true 
      }))
    ) as any,
    defaultValues: {
      scheduleIntervalHours: 24,
    },
  });

  const handlePresetClick = (preset: typeof PRESET_SITES[0]) => {
    setValue("url", preset.config.url);
    setValue("title", preset.config.title);
    setValue("instructionText", preset.config.instructionText);
    setValue("scheduleIntervalHours", preset.config.scheduleIntervalHours);
    setStatus(null);
  };

  const onSubmit = async (data: CombinedForm) => {
    setStatus(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: { url: data.url, title: data.title },
          instruction: {
            instructionText: data.instructionText,
            scheduleIntervalHours: data.scheduleIntervalHours,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Unable to create task");
      }

      setStatus({
        type: "success",
        message: "Task created successfully! You can now run it below.",
      });
      reset();

      // Refresh the page to show the new task
      setTimeout(() => {
        router.refresh();
        setStatus(null);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setStatus({ type: "error", message: error.message });
      } else {
        setStatus({ type: "error", message: "Unexpected error" });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Start (Click to auto-fill)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_SITES.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/30 bg-white/50 hover:bg-white/70 transition backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-left"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${preset.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Click to use
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/80 px-2 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
            Or enter custom site
          </span>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
        <Label htmlFor="url">Target URL</Label>
        <Input id="url" placeholder="https://producthunt.com" {...register("url")} />
        {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Short label</Label>
        <Input id="title" placeholder="Product Hunt — AI launches" {...register("title")} />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructionText">Instruction</Label>
        <Textarea
          id="instructionText"
          rows={6}
          placeholder='Example: "Fetch innovative projects with >50 upvotes, refresh every 24 hours".'
          {...register("instructionText")}
        />
        {errors.instructionText && (
          <p className="text-xs text-red-500">{errors.instructionText.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduleIntervalHours">Refresh cadence (hours)</Label>
        <Input
          type="number"
          min={1}
          max={168}
          id="scheduleIntervalHours"
          {...register("scheduleIntervalHours", { valueAsNumber: true })}
        />
        {errors.scheduleIntervalHours && (
          <p className="text-xs text-red-500">{errors.scheduleIntervalHours.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create task
      </Button>
      {status && (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {status.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
          <div>
            <p className="font-medium">{status.message}</p>
            {status.type === "success" && (
              <p className="text-xs mt-1 opacity-80">Refreshing page...</p>
            )}
          </div>
        </div>
      )}
      </form>
    </div>
  );
};

