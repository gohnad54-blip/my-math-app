import type { Difficulty } from "@/lib/taskSchema";

export const CATEGORIES = [
  { id: "linear", label: "Лінійні рівняння та системи з параметром" },
  { id: "quadratic", label: "Квадратні рівняння та нерівності з параметром" },
  { id: "irrational", label: "Ірраціональні рівняння та нерівності з параметром" },
  {
    id: "trigonometric",
    label: "Тригонометричні рівняння та нерівності з параметром",
  },
  {
    id: "graphical",
    label: "Графічний метод розв'язання рівнянь/нерівностей з параметром",
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryId = Category["id"];
export type BaseCategory = CategoryId | "random";

export const BASE_CATEGORY_OPTIONS = [
  ...CATEGORIES,
  { id: "random" as const, label: "Випадкова" },
];

export const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "basic", label: "Базовий" },
  { id: "medium", label: "Середній" },
  { id: "hard", label: "Складний" },
];

export function getDifficultyLabel(difficulty: Difficulty): string {
  return (
    DIFFICULTY_OPTIONS.find((option) => option.id === difficulty)?.label ??
    difficulty
  );
}

export const TOPIC_STYLE_DESCRIPTIONS: Record<CategoryId, string> = {
  linear:
    "Лінійні рівняння, нерівності або системи з параметром; дослідження параметра по випадках, аналіз кількості розв'язків.",
  quadratic:
    "Квадратні рівняння або нерівності з параметром; теорема Вієта, дискримinant, розбиття на випадки за знаком параметра.",
  irrational:
    "Ірраціональні рівняння або нерівності з параметром; обов'язковий аналіз ОДЗ, перевірка сторонніх коренів.",
  trigonometric:
    "Тригонометричні рівняння або нерівності з параметром; використання тригонометричних тотожностей, періодичності, розбиття на проміжки.",
  graphical:
    "Графічний метод: побудова графіків функцій залежно від параметра, геометрична інтерпретація умови.",
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rollExtraTopicCount(difficulty: Difficulty): number {
  const roll = Math.random();

  if (difficulty === "basic") {
    return roll < 0.9 ? 0 : 1;
  }

  if (difficulty === "medium") {
    if (roll < 0.55) return 0;
    if (roll < 0.9) return 1;
    return 2 + Math.floor(Math.random() * 2);
  }

  if (roll < 0.25) return 0;
  if (roll < 0.7) return 1;
  return 2 + Math.floor(Math.random() * 2);
}

export function pickTopics(
  baseCategory: BaseCategory,
  difficulty: Difficulty,
): CategoryId[] {
  const base: CategoryId =
    baseCategory === "random"
      ? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id
      : baseCategory;

  const extraCount = Math.min(
    rollExtraTopicCount(difficulty),
    CATEGORIES.length - 1,
  );

  const otherTopics = CATEGORIES.map((category) => category.id).filter(
    (id) => id !== base,
  );

  const extras = shuffle(otherTopics).slice(0, extraCount);
  return [base, ...extras];
}

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function getCategoryLabels(ids: CategoryId[]): string[] {
  return ids.map(getCategoryLabel);
}
