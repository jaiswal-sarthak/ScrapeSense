/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { db } from "../lib/supabase/queries";

async function main() {
    const instructions = await db.getActiveInstructions();
    console.log("Active instructions status:");
    for (const inst of instructions) {
        const site = (Array.isArray(inst.site) ? inst.site[0] : inst.site) as any;
        console.log(`- ID: ${inst.id}`);
        console.log(`  URL: ${site?.url}`);
        console.log(`  Last Run: ${inst.last_run?.[0]?.run_time ?? "Never"}`);
    }
}

main().catch(console.error);
