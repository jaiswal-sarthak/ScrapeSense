/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { runScrape } from "../lib/scraper/runner";
import { db } from "../lib/supabase/queries";
import { chromium } from "playwright";

async function main() {
    const instructions = await db.getActiveInstructions();
    const target = instructions.find(i => {
        const s = (Array.isArray(i.site) ? i.site[0] : i.site) as any;
        return s?.url?.includes("producthunt") || s?.title?.includes("product hunt");
    });

    if (!target) {
        console.error("No Product Hunt instruction found.");
        return;
    }

    const site = (Array.isArray(target.site) ? target.site[0] : target.site) as any;
    console.log(`Debugging scrape for: ${site.url}`);
    console.log("Schema:", JSON.stringify(target.ai_generated_schema, null, 2));

    console.log("Running scrape...");

    // Custom debug logic to check text content directly
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(site.url, { waitUntil: "networkidle", timeout: 60000 });
        const bodyText = await page.innerText("body");
        console.log("Body text length:", bodyText.length);
        if (bodyText.includes("Gemini 3")) {
            console.log("Found 'Gemini 3' in body text! Content is rendered.");
        } else {
            console.log("'Gemini 3' NOT found in body text.");
        }

        // Try to find a selector that matches
        const selectors = [".product-card", "[data-test='post-item']", "div[class*='styles_item']", "main section div"];
        for (const sel of selectors) {
            try {
                const count = await page.locator(sel).count();
                console.log(`Selector '${sel}': found ${count} nodes`);
            } catch (e: any) {
                console.log(`Selector '${sel}': error ${e.message}`);
            }
        }

    } catch (e) {
        console.error("Debug check failed:", e);
    } finally {
        await browser.close();
    }

    // Run the actual scraper
    try {
        const results = await runScrape(site.url, target.ai_generated_schema as any);
        console.log(`Scrape finished. Found ${results.length} items.`);
        if (results.length > 0) {
            console.log("First item:", results[0]);
        } else {
            console.log("No items found via runScrape.");
        }
    } catch (error) {
        console.error("Scrape failed:", error);
    }
}

main().catch(console.error);
