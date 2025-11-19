/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { runScrape } from "../lib/scraper/runner";
import { summarizeResults } from "../lib/ai/groq";
import { db } from "../lib/supabase/queries";

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
    console.log("Scraping all active instructions...");

    const instructions = await db.getActiveInstructions();
    console.log(`Found ${instructions.length} active instructions`);

    for (const instruction of instructions) {
        const site = (Array.isArray(instruction.site) ? instruction.site[0] : instruction.site) as any;

        if (!instruction.ai_generated_schema || !site?.url) {
            console.log(`Skipping ${site?.title ?? 'unknown'} - missing schema or URL`);
            continue;
        }

        console.log(`\n🔄 Scraping: ${site.title ?? site.url}`);
        console.log(`   Instruction: ${instruction.instruction_text}`);

        try {
            const results = await runScrape(site.url, instruction.ai_generated_schema as any);
            console.log(`   ✓ Found ${results.length} items`);

            if (results.length > 0) {
                // Generate AI summary
                const summary = await summarizeResults(
                    results.slice(0, 10).map((item) => ({
                        title: item.title,
                        description: item.description ?? "",
                        metadata: item.metadata,
                    }))
                ).catch(() => null);
                const summaryText = toSummary(summary);

                // Insert results
                await db.insertResults(
                    instruction.id,
                    results.map(r => ({
                        ...r,
                        ai_summary: summaryText ?? undefined,
                    }))
                );
                console.log(`   ✓ Inserted ${results.length} results`);

                if (summaryText) {
                    console.log(`   ✓ AI Summary: ${summaryText.substring(0, 100)}...`);
                }

                // Log success
                await db.logScrapeRun({
                    instructionId: instruction.id,
                    status: "success",
                    durationMs: 0,
                });

                await db.updateSiteHealth(site.id, "healthy");
            } else {
                console.log(`   ⚠ No items found`);
            }
        } catch (error) {
            console.error(`   ✗ Failed:`, error instanceof Error ? error.message : error);
            await db.logScrapeRun({
                instructionId: instruction.id,
                status: "failed",
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            });
            await db.updateSiteHealth(site.id, "failed");
        }
    }

    console.log("\n✅ All scrapes complete!");
}

main().catch(console.error);
