import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { inspectPage } from "@/lib/scraper/html-inspector";
import { generateSchemaFromHTML } from "@/lib/ai/groq";
import { clearCacheByPattern } from "@/lib/ai/cache";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { instructionId } = await request.json();

        if (!instructionId) {
            return NextResponse.json(
                { message: "instructionId is required" },
                { status: 400 }
            );
        }

        // Fetch instruction
        const instructions = await db.getActiveInstructions();
        const instruction = instructions.find((i: any) => i.id === instructionId);

        if (!instruction) {
            return NextResponse.json(
                { message: "Instruction not found" },
                { status: 404 }
            );
        }

        const site = Array.isArray(instruction.site)
            ? instruction.site[0]
            : instruction.site;

        if (!site?.url) {
            return NextResponse.json(
                { message: "Site URL not found" },
                { status: 400 }
            );
        }

        // Clear any cached schemas for this URL
        console.log(`Clearing cache for: ${site.url}`);
        clearCacheByPattern({ url: site.url, type: "schema" });
        
        // Inspect page
        console.log(`Inspecting page: ${site.url}`);
        const inspection = await inspectPage(site.url);

        // Generate schema from HTML (will not hit cache now)
        console.log("Generating fresh schema from HTML...");
        const newSchema = await generateSchemaFromHTML({
            url: site.url,
            instruction: instruction.instruction_text,
            htmlSnippet: inspection.htmlSnippet,
            patterns: inspection.patterns,
        });

        // Update instruction with new schema
        await db.updateInstruction(instructionId, { aiSchema: newSchema });

        return NextResponse.json({
            success: true,
            oldSchema: instruction.ai_generated_schema,
            newSchema,
            patterns: inspection.patterns,
        });
    } catch (error) {
        console.error("Schema regeneration failed:", error);

        // Log detailed error information
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        // Provide helpful error message for AI provider issues
        let errorMessage = "Failed to regenerate schema";
        if (error instanceof Error) {
            if (error.message.includes("No AI providers configured")) {
                errorMessage = "No AI providers configured. Please add at least one API key (OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY) to your .env file.";
            } else if (error.message.includes("All AI providers failed")) {
                errorMessage = "All AI providers failed. Please check your API keys and try again.";
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            {
                message: errorMessage,
                error: error instanceof Error ? error.message : "Unknown error",
                errorType: error instanceof Error ? error.name : typeof error,
            },
            { status: 500 }
        );
    }
}
