import MathContent from "@/components/MathContent";

interface ResultPanelProps {
  isCorrect: boolean;
  reasoning: string;
  correctAnswer?: string;
  onShowSolution?: () => void;
  showSolutionButton?: boolean;
}

export default function ResultPanel({
  isCorrect,
  reasoning,
  correctAnswer,
  onShowSolution,
  showSolutionButton = false,
}: ResultPanelProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl border p-6 ${
        isCorrect
          ? "border-success bg-success-bg"
          : "border-error bg-error-bg"
      }`}
      aria-live="polite"
    >
      <h2
        className={`font-heading text-lg font-semibold ${
          isCorrect ? "text-success" : "text-error"
        }`}
      >
        {isCorrect ? "Правильно! 🎉" : "Неправильно"}
      </h2>

      <MathContent
        content={reasoning}
        className="text-sm leading-relaxed text-foreground"
      />

      {!isCorrect && correctAnswer && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Правильна відповідь:
          </p>
          <MathContent
            content={correctAnswer}
            className="text-sm leading-relaxed text-foreground"
          />
        </div>
      )}

      {showSolutionButton && onShowSolution && (
        <button
          type="button"
          onClick={onShowSolution}
          className="min-h-[44px] self-start rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-page"
        >
          Показати розв&apos;язок
        </button>
      )}
    </section>
  );
}
