"use client";

export const FILTER_ALL = "Todos";

interface FilterChipsProps {
  label: string;
  options: readonly string[];
  active: string;
  onChange: (value: string) => void;
  /** Inclui a opção "Todos" no início. */
  includeAll?: boolean;
}

/** Linha de filtros com rolagem horizontal no mobile. */
export function FilterChips({ label, options, active, onChange, includeAll = true }: FilterChipsProps) {
  const allOptions = includeAll ? [FILTER_ALL, ...options] : options;

  return (
    <div>
      <span className="eyebrow mb-2.5 block">{label}</span>
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        role="group"
        aria-label={label}
      >
        {allOptions.map((option) => {
          const isActive = option === active;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option)}
              className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full border px-4 text-[0.8125rem] transition-[background-color,border-color,color] duration-200 ${
                isActive
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
