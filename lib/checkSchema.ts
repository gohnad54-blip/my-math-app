import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { z } from "zod";

export const checkResultSchema = z.object({
  is_correct: z.boolean(),
  reasoning: z.string().min(1),
});

export type CheckResult = z.infer<typeof checkResultSchema>;

export const checkAnswerRequestSchema = z.object({
  task_statement: z.string().min(1),
  correct_answer: z.string().min(1),
  user_answer: z.string().min(1),
  answer_format_hint: z.string().min(1),
});

export type CheckAnswerRequest = z.infer<typeof checkAnswerRequestSchema>;

export const geminiCheckResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    is_correct: { type: SchemaType.BOOLEAN },
    reasoning: { type: SchemaType.STRING },
  },
  required: ["is_correct", "reasoning"],
};
