export interface AnswerFormatGuide {
  isInterval: boolean;
  placeholder: string;
  example: string;
  helperText: string;
}

const INTERVAL_PATTERN =
  /[∈∉]|\\in\b|\bin\b|інтервал|\([^)]*;[^)]*\)|\[[^\]]*;[^\]]*\)|;|\+∞|-∞/i;

function stripLatex(value: string): string {
  return value
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractParameterName(text: string): string {
  const plain = stripLatex(text);
  const match = plain.match(/\b([a-zA-Z])\s*[∈=<>]/);
  return match?.[1] ?? "a";
}

function looksLikeInterval(text: string): boolean {
  return INTERVAL_PATTERN.test(stripLatex(text));
}

export function getAnswerFormatGuide(
  answerFormatHint: string,
  correctAnswer: string,
): AnswerFormatGuide {
  const isInterval =
    looksLikeInterval(answerFormatHint) || looksLikeInterval(correctAnswer);
  const parameter = extractParameterName(
    `${answerFormatHint} ${correctAnswer}`,
  );

  if (!isInterval) {
    return {
      isInterval: false,
      placeholder: "Наприклад: 2 або a = 3",
      example: `Приклад: ${parameter} = 2`,
      helperText:
        "Введіть відповідь у вільному форматі, як у підказці вище.",
    };
  }

  return {
    isInterval: true,
    placeholder: `${parameter} ∈ (-2; 5)`,
    example: `Приклад: ${parameter} ∈ (-2; 5) або ${parameter} ∈ [1; +∞)`,
    helperText:
      "Для інтервалу використовуйте формат з дужками та крапкою з комою: ( ) або [ ]. Наприклад: a ∈ (-2; 5), a ∈ [1; +∞), a ∈ (-∞; 3].",
  };
}

export function formatIntervalAnswer(
  rawValue: string,
  parameter: string,
): string {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return "";
  }

  if (/[∈∉]|\\in\b|\bin\b/.test(trimmed)) {
    return trimmed;
  }

  const intervalBody = trimmed.replace(/^[([]+|[)\]]+$/g, "");
  if (/;/.test(intervalBody) || /∞/.test(intervalBody)) {
    const hasOpenSquare = trimmed.startsWith("[");
    const hasCloseSquare = trimmed.endsWith("]");
    const open = hasOpenSquare ? "[" : "(";
    const close = hasCloseSquare ? "]" : ")";
    const inner = intervalBody.replace(/^[([]+|[)\]]+$/g, "");
    return `${parameter} ∈ ${open}${inner}${close}`;
  }

  return trimmed;
}
