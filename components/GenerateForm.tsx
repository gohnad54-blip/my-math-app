"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelector from "@/components/CategorySelector";
import DifficultySelector from "@/components/DifficultySelector";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { BaseCategory } from "@/lib/categories";
import {
  readLastSelection,
  writeCurrentTask,
  writeLastSelection,
} from "@/lib/storage";
import type { Difficulty, GeneratedTask } from "@/lib/taskSchema";

function readTaskHistory() {
  try {
    const raw = sessionStorage.getItem("taskHistory");
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

export default function GenerateForm() {
  const router = useRouter();
  const [category, setCategory] = useState<BaseCategory>("random");
  const [difficulty, setDifficulty] = useState<Difficulty>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
        <p
          role="alert"
          className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
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
