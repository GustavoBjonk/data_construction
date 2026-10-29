import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "./Icons";

type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-fg text-bg hover:bg-white",
  accent: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border border-line-strong text-fg hover:border-fg/40 hover:bg-fg/5",
  ghost: "text-fg hover:text-accent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-[44px] px-5 text-sm",
  sm: "min-h-[36px] px-4 text-[0.8125rem]",
};

const BASE_CLASSES =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-200 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  /** Exibe seta ao final; links externos usam seta diagonal. */
  withArrow?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external = false,
  withArrow = false,
  onClick,
  type = "button",
  disabled,
  className = "",
}: ButtonProps) {
  // `ghost` é um link com seta: mantém a altura de toque, sem padding horizontal.
  const sizeClasses = variant === "ghost" ? SIZE_CLASSES[size].replace(/\bpx-\S+/, "px-0") : SIZE_CLASSES[size];
  const classes = `${BASE_CLASSES} ${sizeClasses} ${VARIANT_CLASSES[variant]} ${className}`;
  const arrow = !withArrow ? null : external ? (
    <ArrowUpRightIcon className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  ) : (
    <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {arrow}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {arrow}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
      {arrow}
    </button>
  );
}
