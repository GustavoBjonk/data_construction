/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O conteúdo é lido de content/*.json via fs (lib/content/store.ts): inclui
  // os arquivos nas funções do servidor, já que o rastreamento não os detecta.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.json"],
  },
  async redirects() {
    return [
      {
        source: "/projetos-sobre",
        destination: "/projetos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
