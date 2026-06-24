"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Не вдалося увійти. Спробуйте ще раз.");
        return;
      }

      router.push("/generate");
      router.refresh();
    } catch {
      setError("Немає з'єднання з сервером. Перевірте інтернет і спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          className="min-h-[44px] rounded-lg border border-border bg-surface px-4 text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>

      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-lg bg-error-bg px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || password.length === 0}
        className="min-h-[44px] rounded-lg bg-primary px-4 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Вхід…" : "Увійти"}
      </button>
    </form>
  );
}
