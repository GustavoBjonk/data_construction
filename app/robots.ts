import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /busca e páginas de conta usam meta noindex; o painel nunca deve ser rastreado.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/conta"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
