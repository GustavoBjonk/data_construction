type BadgeVariant = "accent" | "neutral" | "outline" | "copper";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  accent: "border-accent/30 text-accent",
  neutral: "border-transparent bg-elevated text-muted",
  outline: "border-line-strong text-muted",
  copper: "border-copper/35 text-copper",
};

export function Badge({ children, variant = "accent", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.08em] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
