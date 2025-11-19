import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { instructionSchema, siteSchema } from "@/lib/validators/task";
import { generateExtractionSchema } from "@/lib/ai/groq";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  intervalMs: 60_000,
  uniqueTokenPerInterval: 5,
});

const requestSchema = z.object({
  site: siteSchema,
  instruction: instructionSchema.omit({ siteId: true }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tasks = await db.getDashboardData(session.user.id);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!limiter.check(`tasks-${session.user.id}`)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  const site = await db.upsertSite({
    url: parsed.data.site.url,
    title: parsed.data.site.title,
    userId: session.user.id,
  });

  const aiSchema = await generateExtractionSchema({
    instruction: parsed.data.instruction.instructionText,
    url: parsed.data.site.url,
  }).catch((error) => {
    console.error("AI schema error", error);
    return null;
  });

  const instruction = await db.createInstruction({
    userId: session.user.id,
    siteId: site.id,
    instructionText: parsed.data.instruction.instructionText,
    scheduleIntervalHours: parsed.data.instruction.scheduleIntervalHours,
    aiSchema: aiSchema ?? undefined,
  });

  return NextResponse.json({ instruction, site, aiSchema });
}

