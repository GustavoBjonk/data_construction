type JsonLdValue = Record<string, unknown>;

/**
 * Serializa dados estruturados com escape de `<`, `>` e `&`, evitando que um
 * texto com `</script>` encerre a tag e injete HTML.
 */
export function serializeJsonLd(data: JsonLdValue | JsonLdValue[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026");
}

export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return (
    <script
      type="application/ld+json"
      // Conteúdo serializado e escapado acima.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
