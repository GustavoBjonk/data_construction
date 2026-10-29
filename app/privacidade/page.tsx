import type { Metadata } from "next";
import Link from "next/link";
import { ContactInfo, LegalPage } from "@/components/legal/LegalPage";
import { getAdsConfig } from "@/lib/monetization/ads";
import { getAffiliateTag } from "@/lib/monetization/affiliate";
import { hasActiveAffiliateLinks } from "@/lib/monetization/book-affiliates";
import { isAuthEnabled } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o DataConstruction trata dados pessoais, de acordo com a LGPD.",
  alternates: { canonical: "/privacidade" },
  openGraph: { title: "Política de Privacidade", description: "Como o DataConstruction trata dados pessoais, de acordo com a LGPD.", url: "/privacidade" },
};

export default function PrivacyPage() {
  const ads = getAdsConfig().enabled;
  const affiliate = getAffiliateTag() !== null || hasActiveAffiliateLinks();
  const accounts = isAuthEnabled();

  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      lead="Esta política descreve, de forma direta, quais dados pessoais são tratados ao usar o DataConstruction e quais são os seus direitos segundo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."
      path="/privacidade"
      sections={[
        {
          title: "1. Resumo",
          body: (
            <>
              <p>
                O DataConstruction é um site de conteúdo. Hoje{" "}
                {accounts ? "é possível criar uma conta" : "não há cadastro de usuários"}
                {ads ? ", exibimos anúncios do Google" : " e não exibimos anúncios"}, e não usamos ferramentas de
                análise de tráfego de terceiros.
              </p>
            </>
          ),
        },
        {
          title: "2. Dados tratados",
          body: (
            <ul>
              <li>
                <strong className="text-fg">Registros técnicos de acesso</strong> (endereço IP, data e hora, página e
                navegador), gerados pela hospedagem (Vercel) para segurança e funcionamento do site.
              </li>
              <li>
                <strong className="text-fg">Preferências no seu navegador</strong>: quando aplicável, sua escolha sobre
                cookies de publicidade fica salva no próprio navegador (armazenamento local), não em nossos servidores.
              </li>
              {accounts && (
                <li>
                  <strong className="text-fg">Dados de conta</strong>: nome público, e-mail e senha (armazenada de forma
                  criptografada pelo provedor de autenticação, Supabase). O e-mail nunca é exibido publicamente.
                </li>
              )}
              {ads && (
                <li>
                  <strong className="text-fg">Publicidade</strong>: o Google pode usar cookies e identificadores para
                  exibir e medir anúncios. Anúncios personalizados só são usados com o seu consentimento.
                </li>
              )}
            </ul>
          ),
        },
        {
          title: "3. Finalidades e bases legais",
          body: (
            <ul>
              <li>Funcionamento e segurança do site — legítimo interesse.</li>
              {ads && <li>Anúncios personalizados — consentimento, que pode ser retirado a qualquer momento.</li>}
              {accounts && <li>Conta e participação — execução do serviço solicitado por você.</li>}
            </ul>
          ),
        },
        {
          title: "4. Compartilhamento",
          body: (
            <>
              <p>Os dados são tratados pelos fornecedores necessários ao funcionamento do site:</p>
              <ul>
                <li>Vercel — hospedagem.</li>
                {accounts && <li>Supabase — banco de dados e autenticação.</li>}
                {ads && <li>Google — exibição e medição de anúncios (Google AdSense).</li>}
              </ul>
              <p>Não vendemos dados pessoais.</p>
            </>
          ),
        },
        {
          title: "5. Links externos e de afiliado",
          body: (
            <p>
              O site aponta para fontes, cursos, datasets e livros em sites de terceiros, que têm políticas próprias.
              {affiliate &&
                " Alguns links de livros são de afiliado da Amazon: ao clicar, a Amazon pode usar cookies para atribuir a compra."}
            </p>
          ),
        },
        {
          title: "6. Seus direitos",
          body: (
            <p>
              Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e
              informações sobre compartilhamento, além de revogar consentimentos. Contato: <ContactInfo />.
            </p>
          ),
        },
        {
          title: "7. Cookies",
          body: (
            <p>
              Detalhes na <Link href="/cookies">Política de Cookies</Link>.
            </p>
          ),
        },
        {
          title: "8. Alterações",
          body: <p>Esta política é atualizada quando o funcionamento do site muda. A data no topo indica a última revisão.</p>,
        },
      ]}
    />
  );
}
