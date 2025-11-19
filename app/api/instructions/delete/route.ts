import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const instructionId = searchParams.get("id");

        if (!instructionId) {
            return NextResponse.json(
                { message: "Instruction ID is required" },
                { status: 400 }
            );
        }

        // Delete instruction (will cascade to results and scrape_runs)
        await db.deleteInstruction(instructionId, session.user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete instruction failed:", error);
        return NextResponse.json(
            {
                message: "Failed to delete instruction",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
