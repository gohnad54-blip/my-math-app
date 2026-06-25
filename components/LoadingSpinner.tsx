interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({
  label = "Завантаження…",
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-muted"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
