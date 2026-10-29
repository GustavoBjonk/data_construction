import { Container } from "@/components/layout/Container";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Moldura das páginas de autenticação: coluna estreita, foco no formulário. */
export function AuthShell({ eyebrow, title, lead, children, footer }: AuthShellProps) {
  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-display-3 font-semibold">{title}</h1>
        {lead && <p className="mt-4 text-sm leading-relaxed text-muted">{lead}</p>}
        <div className="mt-10">{children}</div>
        {footer && <div className="mt-10 border-t border-line pt-6 text-sm text-muted">{footer}</div>}
      </div>
    </Container>
  );
}
