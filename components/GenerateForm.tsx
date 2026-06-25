"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelector from "@/components/CategorySelector";
import DifficultySelector from "@/components/DifficultySelector";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressBar from "@/components/ProgressBar";
import type { BaseCategory } from "@/lib/categories";
import { readProgress } from "@/lib/progress";
import {
  readLastSelection,
  writeCurrentTask,
  writeLastSelection,
} from "@/lib/storage";
import { appendTaskHistory, readTaskHistory } from "@/lib/taskHistory";
import type { Difficulty, GeneratedTask } from "@/lib/taskSchema";

export default function GenerateForm() {
  const router = useRouter();
  const [category, setCategory] = useState<BaseCategory>("random");
  const [difficulty, setDifficulty] = useState<Difficulty>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(readProgress());

  useEffect(() => {
    setProgress(readProgress());

    const saved = readLastSelection();
    if (!saved) {
      return;
    }

    setCategory(saved.category as BaseCategory);
    setDifficulty(saved.difficulty as Difficulty);
  }, []);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          difficulty,
          taskHistory: readTaskHistory(),
        }),
      });

      const data = (await response.json()) as GeneratedTask & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Не вдалося згенерувати завдання.");
        return;
      }

      writeCurrentTask(data);
      writeLastSelection({ category, difficulty });
      appendTaskHistory(data);
      router.push("/task");
    } catch {
      setError(
        "Немає з'єднання з сервером. Перевірте інтернет і спробуйте ще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ProgressBar progress={progress} />

      <CategorySelector
        value={category}
        onChange={setCategory}
        disabled={isLoading}
      />

      <DifficultySelector
        value={difficulty}
        onChange={setDifficulty}
        disabled={isLoading}
      />

      {error && (
        <ErrorBanner message={error} onRetry={handleGenerate} />
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Генеруємо завдання…" : "Згенерувати завдання"}
      </button>

      {isLoading && <LoadingSpinner label="Генеруємо завдання…" />}
    </div>
  );
}
