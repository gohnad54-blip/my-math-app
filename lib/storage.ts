export const STORAGE_KEYS = {
  currentTask: "currentTask",
  lastSelection: "lastSelection",
  taskHistory: "taskHistory",
  progress: "progress",
} as const;

export interface LastSelection {
  category: string;
  difficulty: string;
}

export function readLastSelection(): LastSelection | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.lastSelection);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as LastSelection;
  } catch {
    return null;
  }
}

export function writeLastSelection(selection: LastSelection): void {
  sessionStorage.setItem(STORAGE_KEYS.lastSelection, JSON.stringify(selection));
}

export function writeCurrentTask(task: unknown): void {
  sessionStorage.setItem(STORAGE_KEYS.currentTask, JSON.stringify(task));
}

export function readCurrentTaskRaw(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.currentTask);
}

export function clearCurrentTask(): void {
  sessionStorage.removeItem(STORAGE_KEYS.currentTask);
}
