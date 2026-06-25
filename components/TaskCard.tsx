"use client";

import { useMemo } from "react";
import type { GeneratedTask } from "@/lib/taskSchema";
import {
  formatIntervalAnswer,
  getAnswerFormatGuide,
} from "@/lib/answerFormat";
import MathContent from "@/components/MathContent";

interface TaskCardProps {
  task: GeneratedTask;
  userAnswer: string;
  onUserAnswerChange: (value: string) => void;
  onCheckAnswer: () => void;
  isChecking?: boolean;
}

export default function TaskCard({
  task,
  userAnswer,
  onUserAnswerChange,
  onCheckAnswer,
  isChecking = false,
}: TaskCardProps) {
  const hintId = "answer-format-hint";
  const exampleId = "answer-format-example";

  const formatGuide = useMemo(
    () => getAnswerFormatGuide(task.answer_format_hint, task.correct_answer),
    [task.answer_format_hint, task.correct_answer],
  );

  function handleBlur() {
    if (!formatGuide.isInterval || !userAnswer.trim()) {
      return;
    }

    const parameter = formatGuide.example.match(/^([a-zA-Z])/)?.[1] ?? "a";
    const formatted = formatIntervalAnswer(userAnswer, parameter);

    if (formatted !== userAnswer) {
      onUserAnswerChange(formatted);
    }
  }

  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Умова завдання
        </h2>
        <MathContent
          content={task.task_statement}
          className="text-base leading-relaxed text-foreground"
        />
      </section>

      <section className="rounded-lg bg-page px-4 py-3">
        <div id={hintId} className="text-sm text-muted">
          <span className="font-medium text-foreground">Формат відповіді: </span>
          <MathContent
            content={task.answer_format_hint}
            className="mt-1 text-sm leading-relaxed text-muted"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor="user-answer" className="text-sm font-medium text-foreground">
          Ваша відповідь
        </label>
        <input
          id="user-answer"
          type="text"
          value={userAnswer}
          onChange={(event) => onUserAnswerChange(event.target.value)}
          onBlur={handleBlur}
          aria-describedby={`${hintId} ${exampleId}`}
          placeholder={formatGuide.placeholder}
          disabled={isChecking}
          className="min-h-[44px] rounded-lg border border-border bg-surface px-4 text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p id={exampleId} className="text-sm text-muted">
          {formatGuide.example}
        </p>
        {formatGuide.isInterval && (
          <p className="text-xs leading-relaxed text-muted">
            {formatGuide.helperText}
          </p>
        )}
        <button
          type="button"
          onClick={onCheckAnswer}
          disabled={isChecking || userAnswer.trim().length === 0}
          className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? "Перевіряємо…" : "Перевірити"}
        </button>
      </section>
    </article>
  );
}
