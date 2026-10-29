import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { getSessionUser, requireAuthEnabled } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
  requireAuthEnabled();
  if (await getSessionUser()) redirect("/conta");

  return (
    <AuthShell
      eyebrow="Conta"
      title="Criar conta"
      lead="Leitura é sempre aberta. Enviaremos um link para confirmar seu e-mail."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/entrar" className="text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
