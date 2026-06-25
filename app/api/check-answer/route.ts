import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { checkAnswerRaw } from "@/lib/gemini";
import { buildCheckPrompt } from "@/lib/prompts";
import { sanitizeUserInput } from "@/lib/sanitize";
import {
  checkAnswerRequestSchema,
  checkResultSchema,
} from "@/lib/checkSchema";

export async function POST(request: Request) {
  try {
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

    const raw = await checkAnswerRaw(prompt);
    const result = checkResultSchema.parse(JSON.parse(raw));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Невірний формат запиту", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Не вдалося перевірити відповідь. Спробуйте ще раз.",
          code: "CHECK_FAILED",
        },
        { status: 503 },
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
