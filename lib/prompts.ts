import type { CategoryId } from "@/lib/categories";
import { getCategoryLabel, TOPIC_STYLE_DESCRIPTIONS } from "@/lib/categories";
import type { Difficulty } from "@/lib/taskSchema";

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic:
    "Базовий рівень: 2–4 кроки розв'язку; використовуй охайні цілі числа та прості дроби (наприклад, 1/2, 1/3).",
  medium:
    "Середній рівень: 4–7 кроків; допускаються змішані коефіцієнти, у тому числі неохайні в умові, але чисті в аналізі ОДЗ.",
  hard:
    "Складний (олімпіадний) рівень: 7+ кроків, повне дослідження всіх випадків параметра; довільні коефіцієнти, можливі буквені вирази.",
};

export interface GenerationPromptParams {
  topicIds: CategoryId[];
  difficulty: Difficulty;
  randomSeed: number;
  usedPhrasingPatterns: string[];
  usedSignatures: string[];
}

function formatTopicList(topicIds: CategoryId[]): string {
  return topicIds
    .map((topicId, index) => {
      const label = getCategoryLabel(topicId);
      const style = TOPIC_STYLE_DESCRIPTIONS[topicId];
      return `${index + 1}. ${label} — ${style}`;
    })
    .join("\n");
}

function formatUsedList(items: string[]): string {
  if (items.length === 0) {
    return "(немає)";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function buildGenerationPrompt({
  topicIds,
  difficulty,
  randomSeed,
  usedPhrasingPatterns,
  usedSignatures,
}: GenerationPromptParams): string {
  return `Ти — досвідчений укладач олімпіадних задач з математики для українських учнів.

Згенеруй ОДНЕ унікальне математичне завдання з параметром, органічно поєднавши наведені нижче теми в одній задачі.

ТЕМИ ДЛЯ ПОЄДНАННЯ:
${formatTopicList(topicIds)}

РІВЕНЬ СКЛАДНОСТІ: ${DIFFICULTY_DESCRIPTIONS[difficulty]}
Поле difficulty у JSON має бути "${difficulty}".

СТИЛЬ ТА ЗМІСТ:
- Орієнтуйся на стиль українських методичних матеріалів з розділу "Задачі з параметрами".
- Не копіюй конкретні приклади з підручників — лише стиль, нотацію та тип задачі.
- Умова має бути самодостатньою для розв'язання без додаткових пояснень.

ВИМОГИ ДО УНІКАЛЬНОСТІ:
1. Використовуй нетипові, рандомізовані числові коефіцієнти. Уникай "шаблонних" чисел (1, 2, 3, -1, 0, 5) без математичної необхідності — за можливості використовуй коефіцієнти на основі поточного timestamp/seed: ${randomSeed}.
2. Не повторюй словесні шаблони умови. Чергуй формулювання, наприклад:
   "Знайдіть усі значення параметра a, для яких...",
   "При яких значеннях параметра b рівняння...",
   "Дослідіть, для яких параметрів c...",
   "Визначте множину значень параметра m, при яких...",
   "Залежно від значення параметра k розв'яжіть...".
   Обери формулювання, ВІДМІННЕ від наведеного нижче списку вже використаних за цю сесію:
${formatUsedList(usedPhrasingPatterns)}
3. НЕ генеруй завдання, схоже за підходом/коефіцієнтами на наведені нижче сигнатури вже згенерованих у цій сесії завдань:
${formatUsedList(usedSignatures)}
   Якщо тема/рівень збігаються з уже використаними — обери інший математичний прийом дослідження (інший метод розв'язання) для розрізнення.

LaTeX-НОТАЦІЯ:
- Використовуй $...$ для inline-формул і $$...$$ для блокових формул у task_statement, correct_answer та solution_steps.

ФОРМАТ ВІДПОВІДІ КОРИСТУВАЧА:
- У answer_format_hint українською поясни, у якому форматі користувач має ввести відповідь (наприклад: "a ∈ (...)", "ціле число", "значення параметра через кому").

МОВА:
- Увесь user-facing текст (умова, підказки, кроки розв'язку, назви кроків) — виключно українською.

JSON-ВИВІД:
- Поверни СТРОГО JSON за схемою без жодного тексту поза JSON.
- topics — масив id тем англійською: linear, quadratic, irrational, trigonometric, graphical (лише ті, що реально використані).
- solution_steps — послідовні кроки з step_number, title, content.
- coefficients_signature — короткий рядок ключових чисел/букв для дедуплікації.`;
}

export interface CheckPromptParams {
  taskStatement: string;
  answerFormatHint: string;
  correctAnswer: string;
  userAnswer: string;
}

export function buildCheckPrompt({
  taskStatement,
  answerFormatHint,
  correctAnswer,
  userAnswer,
}: CheckPromptParams): string {
  return `Ти — суворий, але справедливий перевіряючий математичних відповідей.
Умова завдання: ${taskStatement}
Очікуваний формат відповіді: ${answerFormatHint}
Правильна відповідь: ${correctAnswer}
Відповідь користувача: ${userAnswer}

Визнач, чи є відповідь користувача математично ЕКВІВАЛЕНТНОЮ правильній відповіді, навіть якщо запис відрізняється (наприклад, "a∈(1;+∞)" та "a>1" — еквівалентні; "x=2" та "x = 2.0" — еквівалентні; неповна відповідь, що пропускає частину множини значень параметра, — НЕ еквівалентна).

Поверни СТРОГО JSON без жодного додаткового тексту за схемою:
{
  "is_correct": boolean,
  "reasoning": "string — короткий коментар українською, чому правильно/неправильно"
}`;
}
