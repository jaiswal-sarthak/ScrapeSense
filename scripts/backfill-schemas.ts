/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { db } from "../lib/supabase/queries";
import { generateExtractionSchema } from "../lib/ai/groq";

async function main() {
    const instructions = await db.getActiveInstructions();
    console.log(`Found ${instructions.length} active instructions`);

    for (const instruction of instructions) {
        const site = (Array.isArray(instruction.site) ? instruction.site[0] : instruction.site) as any;

        if (!instruction.ai_generated_schema) {
            console.log(`Generating schema for instruction ${instruction.id} (${site.url})...`);
            try {
                const schema = await generateExtractionSchema({
                    instruction: instruction.instruction_text,
                    url: site.url,
                });

                if (schema) {
                    console.log(`Schema generated. Updating DB...`);
                    await db.updateInstruction(instruction.id, { aiSchema: schema });
                    console.log(`Updated instruction ${instruction.id}`);
                } else {
                    console.error(`Failed to generate schema for ${instruction.id}`);
                }
            } catch (error) {
                console.error(`Error processing instruction ${instruction.id}:`, error);
            }
        } else {
            console.log(`Instruction ${instruction.id} already has a schema.`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
