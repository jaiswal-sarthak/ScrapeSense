/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { runScrape } from "../lib/scraper/runner";

async function main() {
    const testUrl = "https://www.producthunt.com/";
    const testSchema = {
        selectors: [
            { field: "container", selector: "[data-test^='post-item-']" },
            { field: "name", selector: "[data-test^='post-name-']" },
            { field: "tagline", selector: ".text-14" },
            { field: "upvotes", selector: "[data-test^='vote-button-']" },
            { field: "link", selector: "a", attribute: "href" }
        ],
        filters: {
            upvotes: {
                operator: ">",
                value: 50
            }
        }
    };

    console.log("Testing scraper with correct selectors...");
    console.log("Schema:", JSON.stringify(testSchema, null, 2));

    try {
        const results = await runScrape(testUrl, testSchema as any);
        console.log(`\n✓ Scrape successful! Found ${results.length} items.`);

        if (results.length > 0) {
            console.log("\nFirst 3 items:");
            results.slice(0, 3).forEach((item, i) => {
                console.log(`\n${i + 1}. ${item.title}`);
                console.log(`   URL: ${item.url}`);
                console.log(`   Metadata:`, item.metadata);
            });
        }
    } catch (error) {
        console.error("Scrape failed:", error);
    }
}

main().catch(console.error);
