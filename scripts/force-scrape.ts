import "dotenv/config";
import { runScrape } from "../lib/scraper/runner";
import { summarizeResults } from "../lib/ai/groq";
import { db } from "../lib/supabase/queries";

async function main() {
    console.log("Force scraping Product Hunt...");

    const instructions = await db.getActiveInstructions();
    const phInstruction = instructions.find(i => {
        const s = (Array.isArray(i.site) ? i.site[0] : i.site) as any;
        return s?.url?.includes("producthunt");
    });

    if (!phInstruction) {
        console.error("No Product Hunt instruction found");
        return;
    }

    const site = (Array.isArray(phInstruction.site) ? phInstruction.site[0] : phInstruction.site) as any;
    console.log(`Scraping ${site.url}...`);

    const results = await runScrape(site.url, phInstruction.ai_generated_schema as any);
    console.log(`Found ${results.length} items`);

    if (results.length > 0) {
        console.log("Inserting into database...");
        await db.insertResults(phInstruction.id, results);
        console.log("✓ Inserted results");

        // Generate AI summary
        console.log("Generating AI summary...");
        const summaryPayload = await summarizeResults(results.slice(0, 10));
        console.log("Summary:", summaryPayload);

        // Update last run
        await db.recordScrapeRun(phInstruction.id, results.length);
        console.log("✓ Recorded scrape run");
    }

    console.log("\nDone! Check your dashboard at http://localhost:3000/dashboard");
}

main().catch(console.error);
