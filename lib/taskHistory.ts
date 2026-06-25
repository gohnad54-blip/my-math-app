import type { GeneratedTask } from "@/lib/taskSchema";
import { STORAGE_KEYS } from "@/lib/storage";

export interface TaskHistoryEntry {
  signature: string;
  phrasingPattern: string;
}

export function extractPhrasingPattern(taskStatement: string): string {
  const plain = taskStatement
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.split(/\s+/).slice(0, 5).join(" ");
}

export function buildTaskSignature(task: GeneratedTask): string {
  const topic = task.topics[0] ?? "unknown";
  return `${topic}|${task.difficulty}|${task.coefficients_signature}`;
}

export function readTaskHistory(): TaskHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.taskHistory);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (entry): entry is TaskHistoryEntry =>
          typeof entry === "object" &&
          entry !== null &&
          "signature" in entry &&
          "phrasingPattern" in entry,
      )
      .slice(-20);
  } catch {
    return [];
  }
}

export function appendTaskHistory(task: GeneratedTask): void {
  const entry: TaskHistoryEntry = {
    signature: buildTaskSignature(task),
    phrasingPattern: extractPhrasingPattern(task.task_statement),
  };

  const nextHistory = [...readTaskHistory(), entry].slice(-20);
  sessionStorage.setItem(STORAGE_KEYS.taskHistory, JSON.stringify(nextHistory));
}
