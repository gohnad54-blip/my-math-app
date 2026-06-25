export type LatexSegmentType = "text" | "inline" | "block";

export interface LatexSegment {
  type: LatexSegmentType;
  content: string;
}

export function parseLatexContent(input: string): LatexSegment[] {
  const segments: LatexSegment[] = [];
  let index = 0;

  while (index < input.length) {
    if (input.startsWith("$$", index)) {
      const end = input.indexOf("$$", index + 2);
      if (end === -1) {
        segments.push({ type: "text", content: input.slice(index) });
        break;
      }

      segments.push({
        type: "block",
        content: input.slice(index + 2, end).trim(),
      });
      index = end + 2;
      continue;
    }

    if (input[index] === "$") {
      const end = input.indexOf("$", index + 1);
      if (end === -1) {
        segments.push({ type: "text", content: input.slice(index) });
        break;
      }

      segments.push({
        type: "inline",
        content: input.slice(index + 1, end).trim(),
      });
      index = end + 1;
      continue;
    }

    const nextBlock = input.indexOf("$$", index);
    const nextInline = input.indexOf("$", index);
    const candidates = [nextBlock, nextInline].filter((value) => value !== -1);
    const nextSpecial = candidates.length
      ? Math.min(...candidates)
      : input.length;

    segments.push({
      type: "text",
      content: input.slice(index, nextSpecial),
    });
    index = nextSpecial;
  }

  return segments.filter(
    (segment) => segment.type === "text" || segment.content.length > 0,
  );
}
