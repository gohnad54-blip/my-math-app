"use client";

import { useRef } from "react";

const QUICK_SYMBOLS = [
  "∈",
  "[",
  "]",
  "(",
  ")",
  ";",
  "+∞",
  "-∞",
  "√",
  "±",
] as const;

interface AnswerSymbolPadProps {
  disabled?: boolean;
  onInsert: (symbol: string) => void;
}

export default function AnswerSymbolPad({
  disabled = false,
  onInsert,
}: AnswerSymbolPadProps) {
  return (
    <div
      className="flex flex-col gap-2"
      role="toolbar"
      aria-label="Швидке вставлення символів"
    >
      <p className="text-xs font-medium text-muted">Швидкі символи</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_SYMBOLS.map((symbol) => (
          <SymbolButton
            key={symbol}
            symbol={symbol}
            disabled={disabled}
            onInsert={onInsert}
          />
        ))}
      </div>
    </div>
  );
}

interface SymbolButtonProps {
  symbol: string;
  disabled?: boolean;
  onInsert: (symbol: string) => void;
}

function SymbolButton({ symbol, disabled, onInsert }: SymbolButtonProps) {
  const label = `Вставити ${symbol}`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onInsert(symbol)}
      className="min-h-[44px] min-w-[44px] rounded-lg border border-border bg-page px-3 text-base font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      {symbol}
    </button>
  );
}

export function insertAtCursor(
  value: string,
  symbol: string,
  selection: { start: number; end: number },
): { nextValue: string; cursor: number } {
  const { start, end } = selection;
  const nextValue = value.slice(0, start) + symbol + value.slice(end);
  return { nextValue, cursor: start + symbol.length };
}

export function useAnswerInputSelection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  function saveSelection() {
    if (!inputRef.current) {
      return;
    }

    selectionRef.current = {
      start: inputRef.current.selectionStart ?? 0,
      end: inputRef.current.selectionEnd ?? 0,
    };
  }

  function restoreCursor(position: number) {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(position, position);
      selectionRef.current = { start: position, end: position };
    });
  }

  function insertSymbol(
    value: string,
    symbol: string,
    onChange: (next: string) => void,
  ) {
    saveSelection();
    const { nextValue, cursor } = insertAtCursor(
      value,
      symbol,
      selectionRef.current,
    );
    onChange(nextValue);
    restoreCursor(cursor);
  }

  return {
    inputRef,
    saveSelection,
    insertSymbol,
  };
}
