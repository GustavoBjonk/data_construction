"use client";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2.5 block">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[44px] w-full rounded-card border border-line bg-surface px-3 text-sm text-fg transition-colors hover:border-line-strong focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/60 sm:w-auto sm:min-w-[14rem]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
