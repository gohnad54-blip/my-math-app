import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { z } from "zod";

export const difficultySchema = z.enum(["basic", "medium", "hard"]);

export const solutionStepSchema = z.object({
  step_number: z.number().int().positive(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export const generatedTaskSchema = z.object({
  task_statement: z.string().min(1),
  topics: z.array(z.string()).min(1),
  difficulty: difficultySchema,
  answer_format_hint: z.string().min(1),
  correct_answer: z.string().min(1),
  solution_steps: z.array(solutionStepSchema).min(1),
  coefficients_signature: z.string().min(1),
});

export type GeneratedTask = z.infer<typeof generatedTaskSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;

export const generateTaskRequestSchema = z.object({
  category: z.enum([
    "linear",
    "quadratic",
    "irrational",
    "trigonometric",
    "graphical",
    "random",
  ]),
  difficulty: difficultySchema,
  taskHistory: z
    .array(
      z.object({
        signature: z.string(),
        phrasingPattern: z.string(),
      }),
    )
    .default([]),
});

export type GenerateTaskRequest = z.infer<typeof generateTaskRequestSchema>;

export const geminiTaskResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    task_statement: { type: SchemaType.STRING },
    topics: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    difficulty: { type: SchemaType.STRING },
    answer_format_hint: { type: SchemaType.STRING },
    correct_answer: { type: SchemaType.STRING },
    solution_steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step_number: { type: SchemaType.INTEGER },
          title: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
        },
        required: ["step_number", "title", "content"],
      },
    },
    coefficients_signature: { type: SchemaType.STRING },
  },
  required: [
    "task_statement",
    "topics",
    "difficulty",
    "answer_format_hint",
    "correct_answer",
    "solution_steps",
    "coefficients_signature",
  ],
};
