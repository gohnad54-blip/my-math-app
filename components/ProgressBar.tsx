"use client";

import type { SessionProgress } from "@/lib/progress";
import { readProgress } from "@/lib/progress";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  progress?: SessionProgress | null;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const [storedProgress, setStoredProgress] = useState<SessionProgress | null>(
    null,
  );

  useEffect(() => {
    if (progress === undefined) {
      setStoredProgress(readProgress());
    }
  }, [progress]);

  const current = progress ?? storedProgress;

  if (!current || current.solved === 0) {
    return null;
  }

  return (
    <section
      aria-label="Прогрес сесії"
      className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted"
    >
      <p className="font-medium text-foreground">Прогрес за сесію</p>
      <p className="mt-1">
        Розв&apos;язано:{" "}
        <span className="font-medium text-foreground">{current.solved}</span>
        {" · "}
        Правильно:{" "}
        <span className="font-medium text-success">{current.correct}</span>
        {" · "}
        Неправильно:{" "}
        <span className="font-medium text-error">{current.incorrect}</span>
      </p>
    </section>
  );
}
