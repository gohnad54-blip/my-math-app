import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";
import type { ZodSchema } from "zod";
import { geminiCheckResponseSchema } from "@/lib/checkSchema";
import { geminiTaskResponseSchema } from "@/lib/taskSchema";

const GEMINI_TIMEOUT_MS = 15_000;

function getGenerativeModel(responseSchema: ResponseSchema) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Gemini request timed out")), ms);
  });
}

async function generateGeminiJson(
  prompt: string,
  responseSchema: ResponseSchema,
): Promise<string> {
  const model = getGenerativeModel(responseSchema);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}

export async function callGeminiWithRetry<T>(
  promptFn: () => Promise<string>,
  schema: ZodSchema<T>,
  maxRetries = 2,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  let lastError = "";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const raw = await Promise.race([promptFn(), timeout(GEMINI_TIMEOUT_MS)]);
      const parsed = JSON.parse(raw);
      const validated = schema.parse(parsed);
      return { success: true, data: validated };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";

      if (attempt < maxRetries) {
        await sleep(500 * (attempt + 1));
      }
    }
  }

  return { success: false, error: lastError };
}

export async function generateTaskWithRetry<T>(
  prompt: string,
  schema: ZodSchema<T>,
) {
  return callGeminiWithRetry(
    () => generateGeminiJson(prompt, geminiTaskResponseSchema),
    schema,
  );
}

export async function checkAnswerWithRetry<T>(
  prompt: string,
  schema: ZodSchema<T>,
) {
  return callGeminiWithRetry(
    () => generateGeminiJson(prompt, geminiCheckResponseSchema),
    schema,
  );
}
