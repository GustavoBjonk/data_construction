export interface StatItem {
  value: string | number;
  label: string;
}

/** Indicadores numéricos separados por linhas verticais discretas. */
export function StatList({ items, className = "" }: { items: StatItem[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-y-6 sm:flex ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex flex-col-reverse sm:px-6 sm:first:pl-0 ${index > 0 ? "sm:border-l sm:border-line" : ""}`}
        >
          <dt className="eyebrow mt-1">{item.label}</dt>
          <dd className="font-display text-2xl font-medium tabular-nums tracking-tight text-fg sm:text-[1.75rem]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
