import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IntroGate } from "@/components/layout/IntroGate";
import { AutoAds } from "@/components/monetization/AutoAds";
import { ConsentBanner } from "@/components/monetization/ConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAdsConfig } from "@/lib/monetization/ads";
import { ADS_SETTINGS } from "@/lib/monetization/placements";
import { SITE, absoluteUrl } from "@/lib/site";
import "./globals.css";

// Fonte variável: um único arquivo cobre todos os pesos usados (400–700).
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ads = getAdsConfig();

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Dados na prática`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/noticias/feed.xml", title: `${SITE.name} — Notícias` }] },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — Dados na prática`,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Dados na prática`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  // Verificação do site no AdSense: só depende do Publisher ID, não carrega anúncios.
  ...(ads.client ? { other: { "google-adsense-account": ads.client } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#090D0F",
  colorScheme: "dark",
};

/** Remove `no-js` antes da pintura para que o reveal só oculte conteúdo com JS ativo. */
const NO_JS_SCRIPT = "document.documentElement.classList.remove('no-js')";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`no-js ${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_JS_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Pular para o conteúdo
        </a>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE.name,
              url: SITE.url,
              description: SITE.description,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              inLanguage: "pt-BR",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/busca")}?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        <IntroGate />
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <ConsentBanner />
        {ads.autoAds && ads.client && <AutoAds client={ads.client} excludedPaths={ADS_SETTINGS.autoAdsExcludedPaths} />}
      </body>
    </html>
  );
}
