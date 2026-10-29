import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { ConsentPreferencesButton } from "@/components/monetization/ConsentBanner";
import { getAdsConfig } from "@/lib/monetization/ads";
import { hasActiveAffiliateLinks } from "@/lib/monetization/book-affiliates";
import { isAuthEnabled } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Quais cookies e armazenamentos locais o DataConstruction utiliza.",
  alternates: { canonical: "/cookies" },
  openGraph: { title: "Política de Cookies", description: "Quais cookies e armazenamentos locais o DataConstruction utiliza.", url: "/cookies" },
};

export default function CookiesPage() {
  const ads = getAdsConfig().enabled;
  const accounts = isAuthEnabled();
  const affiliate = hasActiveAffiliateLinks();

  return (
    <LegalPage
      eyebrow="Cookies"
      title="Política de Cookies"
      lead="Cookies são pequenos arquivos guardados pelo navegador. Esta página lista o que o DataConstruction usa de fato."
      path="/cookies"
      sections={[
        {
          title: "Uso atual",
          body: (
            <ul>
              <li>
                <strong className="text-fg">Essenciais</strong>:{" "}
                {accounts
                  ? "cookies de sessão do login (Supabase), necessários para manter você conectado."
                  : "nenhum cookie próprio é necessário para navegar no site."}
              </li>
              <li>
                <strong className="text-fg">Preferências</strong>: a escolha sobre anúncios personalizados, quando
                aplicável, fica no armazenamento local do navegador (chave <code>dc-consent-v1</code>).
              </li>
              <li>
                <strong className="text-fg">Publicidade</strong>:{" "}
                {ads
                  ? "o Google AdSense usa cookies para exibir e medir anúncios. Nenhum anúncio é carregado antes da sua escolha; se você recusar, os anúncios exibidos são não personalizados."
                  : "no momento, o site não exibe anúncios e não carrega cookies de publicidade."}
              </li>
              {affiliate && (
                <li>
                  <strong className="text-fg">Links de afiliado</strong>: os botões “Ver na Amazon” da página de livros
                  são links de afiliado. O DataConstruction não grava cookies ao exibi-los; ao clicar, a Amazon pode usar
                  cookies próprios, no site dela, para atribuir a compra.
                </li>
              )}
              <li>
                <strong className="text-fg">Análise de tráfego</strong>: não usamos ferramentas de análise de terceiros.
              </li>
            </ul>
          ),
        },
        {
          title: "Como mudar sua escolha",
          body: (
            <>
              <p>Você pode apagar cookies e dados de sites nas configurações do navegador a qualquer momento.</p>
              {ads && (
                <div>
                  <ConsentPreferencesButton />
                </div>
              )}
            </>
          ),
        },
      ]}
    />
  );
}
