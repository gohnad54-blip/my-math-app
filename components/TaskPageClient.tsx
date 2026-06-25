"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import LogoutButton from "@/components/LogoutButton";
import TaskCard from "@/components/TaskCard";
import { getDifficultyLabel } from "@/lib/categories";
import { readCurrentTaskRaw } from "@/lib/storage";
import { generatedTaskSchema, type GeneratedTask } from "@/lib/taskSchema";

export default function TaskPageClient() {
  const router = useRouter();
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = readCurrentTaskRaw();

    if (!raw) {
      router.replace("/generate");
      return;
    }

    try {
      const parsed = generatedTaskSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        sessionStorage.removeItem("currentTask");
        router.replace("/generate");
        return;
      }

      setTask(parsed.data);
    } catch {
      sessionStorage.removeItem("currentTask");
      router.replace("/generate");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading || !task) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-8">
        <LoadingSpinner label="Завантаження завдання…" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            Завдання
          </h1>
          <p className="mt-2 text-sm text-muted">
            Рівень: {getDifficultyLabel(task.difficulty)}
          </p>
        </div>
        <LogoutButton />
      </header>

      <TaskCard
        task={task}
        userAnswer={userAnswer}
        onUserAnswerChange={setUserAnswer}
      />
    </main>
  );
}
