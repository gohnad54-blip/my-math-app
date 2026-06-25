import { STORAGE_KEYS } from "@/lib/storage";

export interface SessionProgress {
  solved: number;
  correct: number;
  incorrect: number;
  categoriesEncountered: string[];
}

const EMPTY_PROGRESS: SessionProgress = {
  solved: 0,
  correct: 0,
  incorrect: 0,
  categoriesEncountered: [],
};

export function readProgress(): SessionProgress {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.progress);
    if (!raw) {
      return EMPTY_PROGRESS;
    }

    const parsed = JSON.parse(raw) as Partial<SessionProgress>;
    return {
      solved: parsed.solved ?? 0,
      correct: parsed.correct ?? 0,
      incorrect: parsed.incorrect ?? 0,
      categoriesEncountered: Array.isArray(parsed.categoriesEncountered)
        ? parsed.categoriesEncountered
        : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function writeProgress(progress: SessionProgress): void {
  sessionStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
}

export function recordAnswerResult(
  isCorrect: boolean,
  topics: string[],
): SessionProgress {
  const current = readProgress();
  const categoriesEncountered = Array.from(
    new Set([...current.categoriesEncountered, ...topics]),
  );

  const next: SessionProgress = {
    solved: current.solved + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
    incorrect: current.incorrect + (isCorrect ? 0 : 1),
    categoriesEncountered,
  };

  writeProgress(next);
  return next;
}
