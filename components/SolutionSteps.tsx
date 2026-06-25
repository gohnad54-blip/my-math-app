import type { SolutionStep } from "@/lib/taskSchema";
import MathContent from "@/components/MathContent";

interface SolutionStepsProps {
  steps: SolutionStep[];
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function SolutionSteps({
  steps,
  collapsible = false,
  expanded = true,
  onToggle,
}: SolutionStepsProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Розв&apos;язання
        </h2>
        {collapsible && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="min-h-[44px] rounded-lg border border-border bg-page px-4 text-sm font-medium text-foreground transition hover:bg-surface"
          >
            {expanded ? "Згорнути розв'язок" : "Розгорнути розв'язок"}
          </button>
        )}
      </div>

      {expanded && (
        <ol className="flex flex-col gap-6">
          {steps.map((step) => (
            <li key={step.step_number} className="flex flex-col gap-2">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Крок {step.step_number}. {step.title}
              </h3>
              <MathContent
                content={step.content}
                className="text-sm leading-relaxed text-foreground"
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
