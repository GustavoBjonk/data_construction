"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-20">
      <p className="eyebrow">Erro inesperado</p>
      <h1 className="mt-4 font-display text-display-2 font-semibold uppercase">
        Algo deu
        <br />
        errado<span className="text-copper">.</span>
      </h1>
      <p className="mt-6 max-w-xl text-muted">
        Não foi possível carregar esta página agora. Tente novamente em alguns instantes.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button href="/" variant="secondary">
          Ir para o início
        </Button>
      </div>
    </Container>
  );
}
