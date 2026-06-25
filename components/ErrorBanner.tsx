interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorBanner({
  message,
  onRetry,
  retryLabel = "Повторити спробу",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg bg-error-bg px-4 py-3 text-sm text-error sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] shrink-0 rounded-lg border border-error bg-surface px-4 font-medium text-error transition hover:bg-page"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
