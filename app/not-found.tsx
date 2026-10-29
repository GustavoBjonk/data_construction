import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-20">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-4 font-display text-display-2 font-semibold uppercase">
        Página não
        <br />
        encontrada<span className="text-accent">.</span>
      </h1>
      <p className="mt-6 max-w-xl text-muted">
        O endereço pode ter mudado ou o conteúdo não existe mais. Tente a busca ou volte para o início.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button href="/" withArrow>
          Ir para o início
        </Button>
        <Button href="/busca" variant="secondary">
          Buscar no site
        </Button>
      </div>
    </Container>
  );
}
