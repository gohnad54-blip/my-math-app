import { redirect } from "next/navigation";
import PasswordForm from "@/components/PasswordForm";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session.authenticated) {
    redirect("/generate");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Задачі з параметрами
        </h1>
        <p className="mt-2 text-sm text-muted">
          Введіть пароль для доступу до генератора завдань
        </p>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
