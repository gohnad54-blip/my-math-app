import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { pickTopics } from "@/lib/categories";
import { generateTaskRaw } from "@/lib/gemini";
import { buildGenerationPrompt } from "@/lib/prompts";
import {
  generateTaskRequestSchema,
  generatedTaskSchema,
} from "@/lib/taskSchema";

export async function POST(request: Request) {
  try {
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

    const raw = await generateTaskRaw(prompt);
    const task = generatedTaskSchema.parse(JSON.parse(raw));

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Не вдалося згенерувати завдання. Спробуйте ще раз.",
          code: "GENERATION_FAILED",
          details: error.flatten(),
        },
        { status: 503 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Не вдалося згенерувати завдання. Спробуйте ще раз.",
          code: "GENERATION_FAILED",
        },
        { status: 503 },
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
