import { DIFFICULTY_OPTIONS } from "@/lib/categories";
import type { Difficulty } from "@/lib/taskSchema";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
  disabled?: boolean;
}

export default function DifficultySelector({
  value,
  onChange,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">Складність</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium transition ${
              value === option.id
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-foreground hover:bg-page"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
