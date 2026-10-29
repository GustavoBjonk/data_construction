/**
 * Programa de Associados da Amazon. A tag (NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG)
 * indica que o programa está em uso e liga o aviso obrigatório em Termos e
 * Privacidade. Os links de compra de cada livro ficam em
 * content/afiliados/livros.json (lib/monetization/book-affiliates.ts).
 */

/** Tags de associado: letras, números e hífens (ex.: "meusite-20"). */
const TAG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{1,62}[A-Za-z0-9]$/;

export const AFFILIATE_DISCLOSURE =
  "Como associado da Amazon, o DataConstruction recebe uma comissão por compras qualificadas feitas a partir destes links, sem custo adicional para você.";

export function getAffiliateTag(raw: string | undefined = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG): string | null {
  const tag = raw?.trim();
  return tag && TAG_PATTERN.test(tag) ? tag : null;
}

/** ISBN-13 válido (dígito verificador). */
export function isValidIsbn13(isbn: string): boolean {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  const sum = [...isbn.slice(0, 12)].reduce((acc, digit, index) => acc + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
}
