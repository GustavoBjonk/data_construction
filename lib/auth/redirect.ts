const DEFAULT_AFTER_LOGIN = "/conta";

/**
 * Aceita apenas caminhos internos ("/conta", "/admin?x=1"). Bloqueia URLs
 * absolutas, protocol-relative ("//evil.com"), barras invertidas e
 * caracteres de controle — evita open redirect após login.
 */
export function safeRedirectPath(value: unknown, fallback = DEFAULT_AFTER_LOGIN): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;

  try {
    // Uma base fictícia: se o resultado mudar de origem, o valor era externo.
    const url = new URL(value, "https://interno.invalid");
    if (url.origin !== "https://interno.invalid") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
