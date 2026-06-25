"use client";

import { BlockMath, InlineMath } from "react-katex";
import { parseLatexContent } from "@/lib/parseLatex";

interface MathContentProps {
  content: string;
  className?: string;
}

function renderMath(type: "inline" | "block", content: string) {
  try {
    if (type === "block") {
      return <BlockMath math={content} />;
    }

    return <InlineMath math={content} />;
  } catch {
    return (
      <span className="font-mono text-sm text-error">
        {type === "block" ? "$$" : "$"}
        {content}
        {type === "block" ? "$$" : "$"}
      </span>
    );
  }
}

export default function MathContent({ content, className }: MathContentProps) {
  const segments = parseLatexContent(content);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <span key={`text-${index}`} className="whitespace-pre-wrap">
              {segment.content}
            </span>
          );
        }

        return (
          <span key={`math-${index}`} className={segment.type === "block" ? "block my-3" : "inline"}>
            {renderMath(segment.type, segment.content)}
          </span>
        );
      })}
    </div>
  );
}
