import type { Metadata } from "next";
import Link from "next/link";
import { ContactInfo, LegalPage } from "@/components/legal/LegalPage";
import { AFFILIATE_DISCLOSURE, getAffiliateTag } from "@/lib/monetization/affiliate";
import { hasActiveAffiliateLinks } from "@/lib/monetization/book-affiliates";
import { getAdsConfig } from "@/lib/monetization/ads";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso do conteúdo do DataConstruction.",
  alternates: { canonical: "/termos" },
  openGraph: { title: "Termos de Uso", description: "Condições de uso do conteúdo do DataConstruction.", url: "/termos" },
};

export default function TermsPage() {
  const ads = getAdsConfig().enabled;
  const affiliate = getAffiliateTag() !== null || hasActiveAffiliateLinks();

  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de Uso"
      lead="Ao usar o DataConstruction, você concorda com estas condições."
      path="/termos"
      sections={[
        {
          title: "1. Conteúdo informativo",
          body: (
            <p>
              Artigos, notícias, trilhas e recomendações têm finalidade educacional e informativa. Fazemos o possível para
              mantê-los corretos e citamos as fontes, mas o conteúdo não substitui orientação profissional. Notícias marcadas
              com revisão editorial pendente devem ser conferidas na fonte original.
            </p>
          ),
        },
        {
          title: "2. Links de terceiros",
          body: (
            <p>
              Cursos, datasets, livros, fontes de notícias e organizações citadas pertencem a terceiros. Não controlamos seus
              preços, conteúdo ou disponibilidade.
            </p>
          ),
        },
        {
          title: "3. Monetização",
          body: (
            <>
              <p>
                {ads
                  ? "O site exibe anúncios do Google, sempre identificados como “Publicidade” e separados do conteúdo editorial."
                  : "No momento, o site não exibe anúncios."}
              </p>
              {affiliate && (
                <p>
                  Os botões “Ver na Amazon” da página <Link href="/livros">Livros</Link> são links de afiliado.{" "}
                  {AFFILIATE_DISCLOSURE}
                </p>
              )}
              <p>Recomendações são editoriais: não aceitamos pagamento para incluir livros, cursos ou ferramentas.</p>
            </>
          ),
        },
        {
          title: "4. Privacidade",
          body: (
            <p>
              O tratamento de dados pessoais está descrito na <Link href="/privacidade">Política de Privacidade</Link>.
            </p>
          ),
        },
        {
          title: "5. Contato e correções",
          body: (
            <p>
              Encontrou um erro ou tem uma solicitação? Contato: <ContactInfo />.
            </p>
          ),
        },
      ]}
    />
  );
}
