import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/AuthForms";
import { getSessionUser, requireAuthEnabled } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Nova senha",
  robots: { index: false, follow: false },
};

/** Chega-se aqui pelo link de recuperação (/auth/confirm cria a sessão). */
export default async function NewPasswordPage() {
  requireAuthEnabled();
  const user = await getSessionUser();

  return (
    <AuthShell eyebrow="Conta" title="Criar nova senha">
      {user ? (
        <NewPasswordForm />
      ) : (
        <p role="alert" className="border-l-2 border-copper pl-4 text-sm leading-relaxed text-copper">
          O link de recuperação é inválido ou expirou.{" "}
          <Link href="/recuperar-senha" className="underline underline-offset-4">
            Solicite um novo
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
