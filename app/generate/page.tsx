import GenerateForm from "@/components/GenerateForm";
import LogoutButton from "@/components/LogoutButton";

export default function GeneratePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Задачі з параметрами
        </h1>
        <LogoutButton />
      </header>

      <GenerateForm />
    </main>
  );
}
