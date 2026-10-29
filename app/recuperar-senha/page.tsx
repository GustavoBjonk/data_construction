import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordResetRequestForm } from "@/components/auth/AuthForms";
import { requireAuthEnabled } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Recuperar acesso",
  robots: { index: false, follow: false },
};

export default function PasswordResetRequestPage() {
  requireAuthEnabled();

  return (
    <AuthShell
      eyebrow="Conta"
      title="Recuperar acesso"
      lead="Informe o e-mail da sua conta. Se ela existir, enviaremos um link para criar uma nova senha."
      footer={
        <Link href="/entrar" className="text-accent hover:text-accent-hover">
          Voltar para o login
        </Link>
      }
    >
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
