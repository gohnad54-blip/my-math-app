import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiTaskResponseSchema } from "@/lib/taskSchema";

function getGenerativeModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: geminiTaskResponseSchema,
    },
  });
}

export async function generateTaskRaw(prompt: string): Promise<string> {
  const model = getGenerativeModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}
