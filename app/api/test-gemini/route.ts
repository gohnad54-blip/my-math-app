import {
  GoogleGenerativeAI,
  type ResponseSchema,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { formatGeminiError } from "@/lib/gemini";
import { geminiTaskResponseSchema } from "@/lib/taskSchema";

const SIMPLE_PROMPT =
  'Reply with only this JSON object and nothing else: {"ok":true,"source":"test-gemini"}';

const STRUCTURED_PROMPT =
  "Generate a minimal math task JSON for testing. Use Ukrainian for text fields.";

function getModelName(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

async function runGeminiTest(
  prompt: string,
  responseSchema?: ResponseSchema,
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: { message: "GEMINI_API_KEY is not configured" },
    };
  }

  const modelName = getModelName();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: responseSchema
      ? {
          responseMimeType: "application/json",
          responseSchema,
        }
      : undefined,
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  let parsed: unknown = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  return {
    success: true,
    model: modelName,
    mode: responseSchema ? "structured" : "simple",
    raw,
    parsed,
    finishReason: result.response.candidates?.[0]?.finishReason ?? null,
    safetyRatings: result.response.candidates?.[0]?.safetyRatings ?? null,
  };
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode");
  const useStructured = mode === "structured";

  try {
    const payload = await runGeminiTest(
      useStructured ? STRUCTURED_PROMPT : SIMPLE_PROMPT,
      useStructured ? geminiTaskResponseSchema : undefined,
    );

    return NextResponse.json({
      ...payload,
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[test-gemini] failed", formatGeminiError(error));

    return NextResponse.json(
      {
        success: false,
        model: getModelName(),
        mode: useStructured ? "structured" : "simple",
        hasApiKey: Boolean(process.env.GEMINI_API_KEY),
        timestamp: new Date().toISOString(),
        error: formatGeminiError(error),
      },
      { status: 500 },
    );
  }
}
