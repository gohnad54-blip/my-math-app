"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import LogoutButton from "@/components/LogoutButton";
import ResultPanel from "@/components/ResultPanel";
import SolutionSteps from "@/components/SolutionSteps";
import TaskCard from "@/components/TaskCard";
import type { CheckResult } from "@/lib/checkSchema";
import { getDifficultyLabel } from "@/lib/categories";
import { clearCurrentTask, readCurrentTaskRaw } from "@/lib/storage";
import { generatedTaskSchema, type GeneratedTask } from "@/lib/taskSchema";

export default function TaskPageClient() {
  const router = useRouter();
  const [task, setTask] = useState<GeneratedTask | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionExpanded, setSolutionExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

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

  async function handleCheckAnswer() {
    if (!task) {
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const response = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_statement: task.task_statement,
          correct_answer: task.correct_answer,
          user_answer: userAnswer,
          answer_format_hint: task.answer_format_hint,
        }),
      });

      const data = (await response.json()) as CheckResult & { error?: string };

      if (!response.ok) {
        setCheckError(
          data.error ?? "Не вдалося перевірити відповідь. Спробуйте ще раз.",
        );
        return;
      }

      setCheckResult(data);
      setShowSolution(false);
      setSolutionExpanded(true);
    } catch {
      setCheckError(
        "Немає з'єднання з сервером. Перевірте інтернет і спробуйте ще раз.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  function handleNextTask() {
    clearCurrentTask();
    router.push("/generate");
  }

  if (isLoading || !task) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-8">
        <LoadingSpinner label="Завантаження завдання…" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
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
        onCheckAnswer={handleCheckAnswer}
        isChecking={isChecking}
      />

      {isChecking && <LoadingSpinner label="Перевіряємо відповідь…" />}

      {checkError && (
        <p
          role="alert"
          className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
        >
          {checkError}
        </p>
      )}

      {checkResult && (
        <>
          <ResultPanel
            isCorrect={checkResult.is_correct}
            reasoning={checkResult.reasoning}
            correctAnswer={
              checkResult.is_correct ? undefined : task.correct_answer
            }
            showSolutionButton={checkResult.is_correct && !showSolution}
            onShowSolution={() => setShowSolution(true)}
          />

          {checkResult.is_correct && showSolution && (
            <SolutionSteps steps={task.solution_steps} />
          )}

          {!checkResult.is_correct && (
            <SolutionSteps
              steps={task.solution_steps}
              collapsible
              expanded={solutionExpanded}
              onToggle={() => setSolutionExpanded((value) => !value)}
            />
          )}

          <button
            type="button"
            onClick={handleNextTask}
            className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover"
          >
            Наступне завдання
          </button>
        </>
      )}
    </main>
  );
}
