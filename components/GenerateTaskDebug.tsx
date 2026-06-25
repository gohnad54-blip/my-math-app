"use client";

import { useState } from "react";
import {
  BASE_CATEGORY_OPTIONS,
  type BaseCategory,
} from "@/lib/categories";
import type { Difficulty, GeneratedTask } from "@/lib/taskSchema";

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "basic", label: "Базовий" },
  { id: "medium", label: "Середній" },
  { id: "hard", label: "Складний" },
];

export default function GenerateTaskDebug() {
  const [category, setCategory] = useState<BaseCategory>("random");
  const [difficulty, setDifficulty] = useState<Difficulty>("basic");
  const [result, setResult] = useState<GeneratedTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, taskHistory: [] }),
      });

      const data = (await response.json()) as GeneratedTask & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Не вдалося згенерувати завдання.");
        return;
      }

      setResult(data);
    } catch {
      setError("Немає з'єднання з сервером. Перевірте інтернет і спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Категорія</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as BaseCategory)
            }
            disabled={isLoading}
            className="min-h-[44px] rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {BASE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Складність</span>
          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as Difficulty)
            }
            disabled={isLoading}
            className="min-h-[44px] rounded-lg border border-border bg-surface px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Генеруємо завдання…" : "Згенерувати"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}

      {result && (
        <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-xs text-foreground">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
