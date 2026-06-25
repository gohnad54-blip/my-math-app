import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
  type ResponseSchema,
} from "@google/generative-ai";
import { ZodError, type ZodSchema } from "zod";
import { geminiCheckResponseSchema } from "@/lib/checkSchema";
import { geminiTaskResponseSchema } from "@/lib/taskSchema";

const GEMINI_TIMEOUT_MS = 15_000;

function getModelName(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

function getGenerativeModel(responseSchema: ResponseSchema) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: getModelName(),
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

function formatGeminiError(error: unknown): Record<string, unknown> {
  const details: Record<string, unknown> = {
    type: error instanceof Error ? error.constructor.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
  };

  if (error instanceof GoogleGenerativeAIFetchError) {
    details.status = error.status;
    details.statusText = error.statusText;
    details.errorDetails = error.errorDetails;
  }

  if (error instanceof GoogleGenerativeAIResponseError) {
    details.response = error.response;
  }

  if (error instanceof ZodError) {
    details.zodIssues = error.issues;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    if ("status" in record && details.status === undefined) {
      details.status = record.status;
    }

    if ("statusText" in record && details.statusText === undefined) {
      details.statusText = record.statusText;
    }

    if ("errorDetails" in record && details.errorDetails === undefined) {
      details.errorDetails = record.errorDetails;
    }

    if ("response" in record && details.response === undefined) {
      details.response = record.response;
    }

    if ("cause" in record && record.cause) {
      details.cause = formatGeminiError(record.cause);
    }
  }

  return details;
}

function logGeminiError(
  context: string,
  attempt: number,
  error: unknown,
  extra: Record<string, unknown> = {},
): void {
  console.error(`[gemini] ${context}`, {
    attempt: attempt + 1,
    model: getModelName(),
    ...extra,
    error: formatGeminiError(error),
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
    let raw = "";

    try {
      raw = await Promise.race([promptFn(), timeout(GEMINI_TIMEOUT_MS)]);
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      logGeminiError("generateContent failed", attempt, error);

      if (attempt < maxRetries) {
        await sleep(500 * (attempt + 1));
      }
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const validated = schema.parse(parsed);
      return { success: true, data: validated };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      logGeminiError("response validation failed", attempt, error, {
        rawResponseText: raw.slice(0, 4000),
        rawResponseLength: raw.length,
      });

      if (attempt < maxRetries) {
        await sleep(500 * (attempt + 1));
      }
    }
  }

  console.error("[gemini] all retry attempts exhausted", {
    attempts: maxRetries + 1,
    model: getModelName(),
    lastError,
  });

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
