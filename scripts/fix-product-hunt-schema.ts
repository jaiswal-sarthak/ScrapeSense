/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { db } from "../lib/supabase/queries";

async function main() {
    console.log("Fixing Product Hunt schemas...");

    const instructions = await db.getActiveInstructions();

    for (const instruction of instructions) {
        const site = (Array.isArray(instruction.site) ? instruction.site[0] : instruction.site) as any;

        if (site?.url?.includes("producthunt")) {
            console.log(`Updating instruction ${instruction.id} for ${site.url}`);

            const fixedSchema = {
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
                },
                summarize_prompt: "Fetch innovative projects with more than 50 upvotes on Product Hunt."
            };

            await db.updateInstruction(instruction.id, { aiSchema: fixedSchema });
            console.log(`✓ Updated schema for instruction ${instruction.id}`);
        }
    }

    console.log("Done!");
}

main().catch(console.error);
