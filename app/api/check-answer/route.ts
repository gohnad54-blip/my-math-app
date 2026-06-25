import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { checkAnswerWithRetry } from "@/lib/gemini";
import { buildCheckPrompt } from "@/lib/prompts";
import {
  enforceRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rateLimit";
import { sanitizeUserInput } from "@/lib/sanitize";
import { getSession } from "@/lib/session";
import {
  checkAnswerRequestSchema,
  checkResultSchema,
} from "@/lib/checkSchema";

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

    const body = checkAnswerRequestSchema.parse(await request.json());
    const userAnswer = sanitizeUserInput(body.user_answer);

    if (userAnswer.length === 0) {
      return NextResponse.json(
        { error: "Відповідь не може бути порожньою" },
        { status: 400 },
      );
    }

    const prompt = buildCheckPrompt({
      taskStatement: body.task_statement,
      answerFormatHint: body.answer_format_hint,
      correctAnswer: body.correct_answer,
      userAnswer,
    });

    const result = await checkAnswerWithRetry(prompt, checkResultSchema);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Не вдалося перевірити відповідь. Спробуйте ще раз.",
          code: "CHECK_FAILED",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Невірний формат запиту", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("check-answer error:", error);

    return NextResponse.json(
      {
        error: "Не вдалося перевірити відповідь. Спробуйте ще раз.",
        code: "CHECK_FAILED",
      },
      { status: 503 },
    );
  }
}
