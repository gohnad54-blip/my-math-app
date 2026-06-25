import type { BaseCategory } from "@/lib/categories";
import { BASE_CATEGORY_OPTIONS } from "@/lib/categories";

interface CategorySelectorProps {
  value: BaseCategory;
  onChange: (value: BaseCategory) => void;
  disabled?: boolean;
}

export default function CategorySelector({
  value,
  onChange,
  disabled = false,
}: CategorySelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">Категорія</legend>
      <div className="flex flex-col gap-2">
        {BASE_CATEGORY_OPTIONS.map((option) => {
          const inputId = `category-${option.id}`;

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                value === option.id
                  ? "border-primary bg-page"
                  : "border-border bg-surface hover:bg-page"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                id={inputId}
                type="radio"
                name="category"
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
