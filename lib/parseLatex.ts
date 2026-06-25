export type LatexSegmentType = "text" | "inline" | "block";

export interface LatexSegment {
  type: LatexSegmentType;
  content: string;
}

const LATEX_COMMAND_PATTERN = /\\[a-zA-Z]+/;
const MATH_SYMBOL_PATTERN = /[\\^_]|\\infty|\\cup|\\cap|\\in|\\notin|\\leq|\\geq|\\neq|\\pm|\\sqrt/;

function normalizeMathDelimiters(input: string): string {
  return input
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math.trim()}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);
}

function isLikelyMathExpression(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  if (/[А-Яа-яІіЇїЄєҐґ]/.test(trimmed)) {
    return false;
  }

  return (
    LATEX_COMMAND_PATTERN.test(trimmed) ||
    MATH_SYMBOL_PATTERN.test(trimmed) ||
    /[∞∈∪∩±√]/.test(trimmed)
  );
}

function splitBareMathSegments(text: string): LatexSegment[] {
  if (!isLikelyMathExpression(text)) {
    return [{ type: "text", content: text }];
  }

  const parts = text.split(/(\s+)/);
  const segments: LatexSegment[] = [];
  let mathBuffer = "";

  function flushMath() {
    if (!mathBuffer) {
      return;
    }

    segments.push({
      type: "inline",
      content: mathBuffer.trim(),
    });
    mathBuffer = "";
  }

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (/^\s+$/.test(part)) {
      if (mathBuffer) {
        mathBuffer += part;
      } else if (segments.length > 0 && segments[segments.length - 1].type === "text") {
        segments[segments.length - 1].content += part;
      } else {
        segments.push({ type: "text", content: part });
      }
      continue;
    }

    if (isLikelyMathExpression(part)) {
      mathBuffer += part;
      continue;
    }

    flushMath();
    segments.push({ type: "text", content: part });
  }

  flushMath();

  if (segments.length === 0) {
    return [{ type: "inline", content: text.trim() }];
  }

  return segments;
}

function postProcessTextSegments(segments: LatexSegment[]): LatexSegment[] {
  return segments.flatMap((segment) => {
    if (segment.type !== "text") {
      return [segment];
    }

    return splitBareMathSegments(segment.content);
  });
}

export function parseLatexContent(input: string): LatexSegment[] {
  const normalized = normalizeMathDelimiters(input);
  const segments: LatexSegment[] = [];
  let index = 0;

  while (index < normalized.length) {
    if (normalized.startsWith("$$", index)) {
      const end = normalized.indexOf("$$", index + 2);
      if (end === -1) {
        segments.push({ type: "text", content: normalized.slice(index) });
        break;
      }

      segments.push({
        type: "block",
        content: normalized.slice(index + 2, end).trim(),
      });
      index = end + 2;
      continue;
    }

    if (normalized[index] === "$") {
      const end = normalized.indexOf("$", index + 1);
      if (end === -1) {
        segments.push({ type: "text", content: normalized.slice(index) });
        break;
      }

      segments.push({
        type: "inline",
        content: normalized.slice(index + 1, end).trim(),
      });
      index = end + 1;
      continue;
    }

    const nextBlock = normalized.indexOf("$$", index);
    const nextInline = normalized.indexOf("$", index);
    const candidates = [nextBlock, nextInline].filter((value) => value !== -1);
    const nextSpecial = candidates.length
      ? Math.min(...candidates)
      : normalized.length;

    segments.push({
      type: "text",
      content: normalized.slice(index, nextSpecial),
    });
    index = nextSpecial;
  }

  return postProcessTextSegments(segments).filter(
    (segment) => segment.type !== "text" || segment.content.length > 0,
  );
}
