import Link from "next/link";

/** Marca: colchetes + nome em caixa alta, como na referência editorial. */
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="DataConstruction — página inicial"
      className="group flex shrink-0 items-center gap-2.5"
      data-intro=""
    >
      <span
        aria-hidden="true"
        className="font-mono text-sm text-muted transition-colors group-hover:text-accent"
      >
        [&nbsp;]
      </span>
      <span className="font-display text-[0.9375rem] font-semibold uppercase tracking-[0.04em] text-fg">
        DataConstruction
      </span>
    </Link>
  );
}
