/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { db } from "../lib/supabase/queries";
import { runScrape } from "../lib/scraper/runner";
import { summarizeResults } from "../lib/ai/groq";
import { sendTelegramMessage } from "../lib/notifications/telegram";
import { sendAlertEmail } from "../lib/notifications/email";

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

async function main() {
  const instructions = await db.getActiveInstructions();
  console.log(`Found ${instructions.length} active instructions`);
  for (const instruction of instructions) {
    const site = (Array.isArray(instruction.site) ? instruction.site[0] : instruction.site) as any;
    if (!instruction.ai_generated_schema || !site?.url) {
      console.log(`Skipping instruction ${instruction.id}: Missing schema or site URL`);
      continue;
    }

    // Check schedule
    const lastRun = instruction.last_run?.[0]?.run_time;
    if (lastRun) {
      const lastRunTime = new Date(lastRun).getTime();
      const hoursSinceLastRun = (Date.now() - lastRunTime) / (1000 * 60 * 60);
      if (hoursSinceLastRun < instruction.schedule_interval_hours) {
        console.log(`Skipping ${site.url} (ran ${hoursSinceLastRun.toFixed(1)}h ago, interval ${instruction.schedule_interval_hours}h)`);
        continue;
      }
    }
    const start = Date.now();
    try {
      const scraped = await runScrape(site.url, instruction.ai_generated_schema);
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
        durationMs: Date.now() - start,
      });

      await db.updateSiteHealth(site.id, "healthy");
      const settings = await db.getSettings(site.user_id);
      if (settings?.telegram_chat_id) {
        await sendTelegramMessage({
          chatId: settings.telegram_chat_id,
          text: `✅ Scrape complete for ${site.title ?? site.url} (${scraped.length} items)`,
        });
      }
      if (settings?.notification_email) {
        await sendAlertEmail({
          to: settings.notification_email,
          subject: "AI Monitor — Scrape complete",
          html: `<p>Finished: ${site.title ?? site.url}</p><p>${scraped.length} items saved.</p>`,
        });
      }
    } catch (error) {
      console.error("Cron scraper error", error);
      if (site?.id) {
        await db.updateSiteHealth(site.id, "failed");
      }
      await db.logScrapeRun({
        instructionId: instruction.id,
        status: "failed",
        durationMs: Date.now() - start,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

