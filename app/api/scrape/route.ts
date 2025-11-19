/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { runScrape } from "@/lib/scraper/runner";
import { summarizeResults } from "@/lib/ai/groq";
import { sendTelegramMessage } from "@/lib/notifications/telegram";
import { sendAlertEmail } from "@/lib/notifications/email";
import { detectSimpleSource } from "@/lib/scraper/simple-sources";

const toSummary = (payload: unknown) => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    const maybe = payload as Record<string, unknown>;
    return (
      (maybe.summary as string | undefined) ??
      (maybe.highlights as string | undefined) ??
      JSON.stringify(maybe)
    );
  }
  return null;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const token = request.headers.get("x-cron-token");

  if (!session?.user && token !== process.env.CRON_SIGNATURE_TOKEN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check if this is a manual run for a specific task
  const body = await request.json().catch(() => ({}));
  const taskId = body.taskId;

  const allInstructions = await db.getActiveInstructions();
  const instructions = taskId 
    ? allInstructions.filter((i: any) => i.id === taskId)
    : allInstructions;

  const jobResults: Array<{ id: string; status: string }> = [];

  for (const instruction of instructions) {
    // Extract site from array (Supabase returns it as array)
    const site = (Array.isArray(instruction.site) ? instruction.site[0] : instruction.site) as any;

    if (!instruction.ai_generated_schema || !site?.url) {
      continue;
    }

    // Check schedule (skip if this is a manual run)
    if (!taskId) {
      const lastRun = instruction.last_run?.[0]?.run_time;
      if (lastRun) {
        const lastRunTime = new Date(lastRun).getTime();
        const hoursSinceLastRun = (Date.now() - lastRunTime) / (1000 * 60 * 60);
        if (hoursSinceLastRun < instruction.schedule_interval_hours) {
          continue;
        }
      }
    }
    const started = Date.now();
    try {
      // Check if we can use a simple API source instead of scraping
      const simpleSource = detectSimpleSource(site.url);
      let scraped;
      
      if (simpleSource) {
        console.log(`[Scraper] Using ${simpleSource.type} for ${site.url}`);
        scraped = await simpleSource.handler();
      } else {
        scraped = await runScrape(site.url, instruction.ai_generated_schema);
      }
      const summary = await summarizeResults(
        scraped.map((item) => ({
          title: item.title,
          description: item.description ?? "",
          metadata: item.metadata,
        })),
      ).catch(() => null);

      const summaryText = toSummary(summary);

      await db.insertResults(
        instruction.id,
        scraped.map((result) => ({
          ...result,
          ai_summary: summaryText ?? undefined,
        })),
      );

      await db.logScrapeRun({
        instructionId: instruction.id,
        status: "success",
        durationMs: Date.now() - started,
      });

      await db.updateSiteHealth(site.id, "healthy");

      const settings = await db.getSettings(site.user_id);
      const alertMessage = `✅ *Scrape complete*\nSite: ${site.title ?? site.url}\nItems: ${scraped.length}\nStatus: success`;

      if (settings?.telegram_chat_id && scraped.length > 0) {
        await sendTelegramMessage({
          chatId: settings.telegram_chat_id,
          text: alertMessage,
        });
      }

      if (settings?.notification_email && scraped.length > 0) {
        await sendAlertEmail({
          to: settings.notification_email,
          subject: "AI Monitor — New results detected",
          html: `<p>Scrape complete for ${site.title ?? site.url}.</p><p>${scraped.length} new items captured.</p>`,
        });
      }

      jobResults.push({ id: instruction.id, status: "success" });
    } catch (error) {
      console.error("Scrape failed", error);
      if (site?.id) {
        await db.updateSiteHealth(site.id, "failed");
      }
      await db.logScrapeRun({
        instructionId: instruction.id,
        status: "failed",
        durationMs: Date.now() - started,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      jobResults.push({ id: instruction.id, status: "failed" });
    }
  }

  return NextResponse.json({ jobs: jobResults });
}

