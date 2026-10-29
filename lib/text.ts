/** Minúsculas e sem acentos, para "análise" casar com "analise". */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Converte um título em âncora (ex.: "Quando usar" → "quando-usar"). */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
