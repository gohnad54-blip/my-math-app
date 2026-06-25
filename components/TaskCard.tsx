import type { GeneratedTask } from "@/lib/taskSchema";
import MathContent from "@/components/MathContent";

interface TaskCardProps {
  task: GeneratedTask;
  userAnswer: string;
  onUserAnswerChange: (value: string) => void;
}

export default function TaskCard({
  task,
  userAnswer,
  onUserAnswerChange,
}: TaskCardProps) {
  const hintId = "answer-format-hint";

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
        <p id={hintId} className="text-sm text-muted">
          <span className="font-medium text-foreground">Формат відповіді: </span>
          {task.answer_format_hint}
        </p>
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
          aria-describedby={hintId}
          placeholder="Введіть відповідь"
          className="min-h-[44px] rounded-lg border border-border bg-surface px-4 text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="button"
          disabled={userAnswer.trim().length === 0}
          className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Перевірити
        </button>
      </section>
    </article>
  );
}
