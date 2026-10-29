import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProfileForm } from "@/components/auth/AuthForms";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { signOutAction } from "@/lib/auth/actions";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ senha?: string }>;
}

export default async function AccountPage({ searchParams }: PageProps) {
  const user = await requireUser("/conta");
  const { senha } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, interests")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <Container className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <p className="eyebrow">Minha conta</p>
          <h1 className="mt-4 font-display text-display-3 font-semibold">{profile?.display_name ?? "Perfil"}</h1>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="eyebrow">E-mail (privado)</dt>
              <dd className="mt-1 break-all text-muted">{user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow">Papel</dt>
              <dd className="mt-2">
                <Badge variant={user.role === "user" ? "outline" : "accent"}>{ROLE_LABELS[user.role]}</Badge>
                {user.status === "suspended" && (
                  <Badge variant="copper" className="ml-2">
                    Conta suspensa
                  </Badge>
                )}
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/recuperar-senha" variant="secondary" size="sm">
              Alterar senha
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </aside>

        <section aria-labelledby="perfil-publico" className="lg:col-span-7 lg:col-start-6">
          <h2 id="perfil-publico" className="eyebrow text-fg">
            Perfil público
          </h2>
          <p className="mt-2 text-sm text-muted">Estas informações podem ser vistas por outras pessoas. Seu e-mail nunca é exibido.</p>
          {senha === "atualizada" && (
            <p role="status" className="mt-6 border-l-2 border-accent pl-4 text-sm text-fg">
              Senha atualizada com sucesso.
            </p>
          )}
          <div className="mt-8">
            <ProfileForm
              initial={{
                displayName: profile?.display_name ?? "",
                username: profile?.username ?? "",
                bio: profile?.bio ?? "",
                interests: Array.isArray(profile?.interests) ? profile.interests.join(", ") : "",
              }}
            />
          </div>
        </section>
      </div>
    </Container>
  );
}
