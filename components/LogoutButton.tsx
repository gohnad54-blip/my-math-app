"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/logout", { method: "POST" });
      sessionStorage.clear();
      router.push("/login");
      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      aria-label="Вийти з облікового запису"
      className="min-h-[44px] rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-page disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Вихід…" : "Вийти"}
    </button>
  );
}
