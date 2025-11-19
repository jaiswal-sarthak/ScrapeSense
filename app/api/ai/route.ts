import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { generateExtractionSchema } from "@/lib/ai/groq";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
  instruction: z.string().min(5),
});

const limiter = rateLimit({
  intervalMs: 60_000,
  uniqueTokenPerInterval: 3,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!limiter.check(`ai-${session.user.id}`)) {
    return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  const result = await generateExtractionSchema({
    url: parsed.data.url,
    instruction: parsed.data.instruction,
  });

  return NextResponse.json({ schema: result });
}

