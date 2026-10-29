import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FuzzyText } from "@/components/ui/FuzzyText";
import { StatList, type StatItem } from "@/components/ui/Stat";
import { HeroCanvas } from "./HeroCanvas";
import { HeroGridFallback } from "./HeroGridFallback";

const MICRO_WORDS = ["Dados", "Pessoas", "Tecnologia", "Oportunidades"];

const INDEX_LINKS = [
  { href: "/noticias", label: "Notícias" },
  { href: "/artigos", label: "Artigos" },
  { href: "/datasets", label: "Datasets" },
  { href: "/trilhas", label: "Trilhas" },
  { href: "/projetos", label: "Projetos" },
  { href: "/doacoes", label: "Doações" },
];

/** Atalho para atrasos da sequência de abertura. */
function delay(ms: number) {
  return { "--intro-delay": `${ms}ms` } as React.CSSProperties;
}

export function Hero({ stats }: { stats: StatItem[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-line">
      {/* Fundo: malha 3D de partículas (mais visível à direita no desktop); a entrada é feita pelo próprio canvas.
          No celular a malha fica numa faixa central que se apaga antes dos indicadores. */}
      <div
        className="absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,transparent_25%,black_70%)] max-sm:opacity-60 max-sm:[mask-image:linear-gradient(to_bottom,transparent_8%,black_28%,black_46%,transparent_62%)] lg:opacity-100 lg:[mask-image:linear-gradient(to_right,transparent_18%,black_55%)]"
      >
        <HeroCanvas />
        <HeroGridFallback />
      </div>

      <Container className="relative grid min-h-[min(calc(100svh-var(--header-height)),860px)] grid-rows-[1fr_auto] gap-12 pb-10 pt-12 sm:pt-16 lg:max-h-[860px] lg:min-h-[680px] lg:grid-cols-12 lg:pb-14">
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="eyebrow leading-[1.6]" data-intro="" style={delay(150)}>
            Aprender
            <br />
            Construir
            <br />
            Compartilhar
          </p>

          <h1 id="hero-title" className="mt-6 font-display text-display-1 font-bold uppercase">
            <span className="block" data-intro="title" style={delay(280)}>
              Dados
            </span>
            <span className="block" data-intro="title" style={delay(420)}>
              na <FuzzyText className="text-accent">prática</FuzzyText>
              <span className="text-copper">.</span>
            </span>
          </h1>

          <p
            className="mt-8 max-w-[34rem] text-base leading-relaxed text-muted sm:text-lg"
            data-intro=""
            style={delay(700)}
          >
            Conhecimento, tecnologia e comunidade para transformar dados em possibilidades.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-intro="" style={delay(850)}>
            <Button href="#conteudos" withArrow>
              Explorar conteúdos
            </Button>
            <Button href="/trilhas" variant="ghost" withArrow>
              Começar a aprender
            </Button>
          </div>
        </div>

        {/* Índice editorial (desktop) */}
        <aside className="hidden lg:col-span-4 lg:col-start-9 lg:flex lg:flex-col lg:justify-center" data-intro="" style={delay(1000)}>
          <div className="ml-auto grid w-full max-w-sm grid-cols-[1fr_auto] gap-8">
            <div>
              <ul className="space-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-subtle">
                {MICRO_WORDS.map((word) => (
                  <li key={word}>· {word}</li>
                ))}
              </ul>
              <p className="mt-10 max-w-[12rem] font-mono text-[0.6875rem] uppercase leading-[1.7] tracking-[0.14em] text-muted">
                Conhecimento aberto para um futuro com dados.
              </p>
              <span aria-hidden="true" className="mt-3 block h-px w-8 bg-line-strong" />
            </div>
            <nav aria-label="Seções" className="border border-line bg-bg/60 px-5 py-4 backdrop-blur-sm">
              <ul className="space-y-1">
                {INDEX_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex min-h-[30px] items-center justify-between gap-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="border-t border-line pt-6 lg:col-span-12" data-intro="" style={delay(1150)}>
          <StatList items={stats} />
        </div>
      </Container>
    </section>
  );
}
