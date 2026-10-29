import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { ConsentPreferencesButton } from "@/components/monetization/ConsentBanner";
import { SITE } from "@/lib/site";

const FOOTER_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Conteúdo",
    links: [
      { href: "/noticias", label: "Notícias" },
      { href: "/artigos", label: "Artigos" },
      { href: "/datasets", label: "Datasets" },
    ],
  },
  {
    title: "Aprender",
    links: [
      { href: "/trilhas", label: "Trilhas" },
      { href: "/projetos", label: "Projetos" },
      { href: "/livros", label: "Livros" },
    ],
  },
  {
    title: "Projeto",
    links: [
      { href: "/sobre", label: "Sobre" },
      { href: "/doacoes", label: "Apoie a educação" },
      { href: "/busca", label: "Buscar no site" },
    ],
  },
];

const LEGAL_LINKS = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/cookies", label: "Cookies" },
  { href: "/termos", label: "Termos de uso" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Conhecimento aberto sobre Dados, Inteligência Artificial e tecnologia — com fontes citadas e
            foco na prática.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="eyebrow">{group.title}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-[36px] items-center text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <nav aria-label="Informações legais" className="flex flex-wrap items-center gap-x-5 normal-case tracking-normal [&_a]:text-xs [&_button]:text-xs">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-[36px] items-center transition-colors hover:text-fg">
                {link.label}
              </Link>
            ))}
            <ConsentPreferencesButton />
          </nav>
        </Container>
      </div>
    </footer>
  );
}
