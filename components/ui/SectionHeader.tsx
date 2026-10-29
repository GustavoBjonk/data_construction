import Link from "next/link";
import { ArrowRightIcon } from "./Icons";

interface SectionHeaderProps {
  title: string;
  id?: string;
  description?: string;
  link?: { href: string; label: string };
  className?: string;
}

/** Cabeçalho de seção no padrão editorial: rótulo mono + link "ver todos". */
export function SectionHeader({ title, id, description, link, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-6 ${className}`}>
      <div className="min-w-0">
        <h2 id={id} className="eyebrow text-fg">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[0.8125rem] text-muted transition-colors hover:text-fg"
        >
          {link.label}
          <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
