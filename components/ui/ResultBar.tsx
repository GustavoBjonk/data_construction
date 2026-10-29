"use client";

interface ResultBarProps {
  shown: number;
  total: number;
  noun: string;
  onClear?: () => void;
}

/** Contador de resultados, anunciado a leitores de tela quando muda. */
export function ResultBar({ shown, total, noun, onClear }: ResultBarProps) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-4 border-b border-line pb-3">
      <p className="font-mono text-xs tabular-nums text-muted" aria-live="polite">
        {shown} de {total} {noun}
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="min-h-[36px] text-[0.8125rem] text-accent transition-colors hover:text-accent-hover"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
