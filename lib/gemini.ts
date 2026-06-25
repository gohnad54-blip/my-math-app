import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";
import { geminiCheckResponseSchema } from "@/lib/checkSchema";
import { geminiTaskResponseSchema } from "@/lib/taskSchema";

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

export async function generateTaskRaw(prompt: string): Promise<string> {
  return generateGeminiJson(prompt, geminiTaskResponseSchema);
}

export async function checkAnswerRaw(prompt: string): Promise<string> {
  return generateGeminiJson(prompt, geminiCheckResponseSchema);
}
