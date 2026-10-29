import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSessionUser, requireAuthEnabled } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ next?: string; erro?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  requireAuthEnabled();
  const { next, erro } = await searchParams;
  const destination = safeRedirectPath(next);

  if (await getSessionUser()) redirect(destination);

  return (
    <AuthShell
      eyebrow="Conta"
      title="Entrar"
      lead="Acesse sua conta."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-accent hover:text-accent-hover">
            Criar conta
          </Link>
        </>
      }
    >
      {erro === "link" && (
        <p role="alert" className="mb-6 border-l-2 border-copper pl-4 text-sm text-copper">
          O link é inválido ou expirou. Solicite um novo.
        </p>
      )}
      <SignInForm next={destination} />
    </AuthShell>
  );
}
