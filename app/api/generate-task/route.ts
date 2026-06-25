import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { pickTopics } from "@/lib/categories";
import { generateTaskWithRetry } from "@/lib/gemini";
import { buildGenerationPrompt } from "@/lib/prompts";
import {
  enforceRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rateLimit";
import { getSession } from "@/lib/session";
import {
  generateTaskRequestSchema,
  generatedTaskSchema,
} from "@/lib/taskSchema";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const rateLimitId = getRateLimitIdentifier(
      session.createdAt,
      request.headers.get("x-forwarded-for"),
    );
    const rateLimit = await enforceRateLimit(rateLimitId, "generation");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Занадто багато запитів, спробуйте за хвилину" },
        { status: 429 },
      );
    }

    const body = generateTaskRequestSchema.parse(await request.json());
    const topicIds = pickTopics(body.category, body.difficulty);
    const history = body.taskHistory.slice(-20);

    const prompt = buildGenerationPrompt({
      topicIds,
      difficulty: body.difficulty,
      randomSeed: Date.now(),
      usedPhrasingPatterns: history.map((item) => item.phrasingPattern),
      usedSignatures: history.map((item) => item.signature),
    });

    const result = await generateTaskWithRetry(prompt, generatedTaskSchema);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Не вдалося згенерувати завдання. Спробуйте ще раз.",
          code: "GENERATION_FAILED",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Невірний формат запиту",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("generate-task error:", error);

    return NextResponse.json(
      {
        error: "Не вдалося згенерувати завдання. Спробуйте ще раз.",
        code: "GENERATION_FAILED",
      },
      { status: 503 },
    );
  }
}
