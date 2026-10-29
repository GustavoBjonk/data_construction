import { buildAdsTxt, getAdsConfig } from "@/lib/monetization/ads";

export const dynamic = "force-static";

/** ads.txt exigido pelo AdSense. Sem Publisher ID configurado, não existe (404). */
export function GET() {
  const body = buildAdsTxt(getAdsConfig().client);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
