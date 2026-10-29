"use client";

import { SearchIcon } from "./Icons";

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ id, label, value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
        size={16}
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? `${label}...`}
        autoComplete="off"
        className="min-h-[44px] w-full rounded-card border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-fg transition-colors placeholder:text-subtle hover:border-line-strong focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/60"
      />
    </div>
  );
}
