/**
 * Caminhos permitidos para conteúdo editorial. Toda leitura (e qualquer
 * gravação futura) passa por aqui: só existe
 * content/<coleção registrada>/<slug>.json. Nada de "..", barras invertidas,
 * caminhos absolutos ou extensões diferentes.
 */
import { COLLECTIONS, SLUG_PATTERN, type CollectionName } from "./schemas.ts";

export const CONTENT_DIR = "content";
const MAX_ID_LENGTH = 120;

export function isCollectionName(value: string): value is CollectionName {
  return Object.hasOwn(COLLECTIONS, value);
}

export function isValidContentId(id: string): boolean {
  return id.length <= MAX_ID_LENGTH && SLUG_PATTERN.test(id);
}

/** Caminho (POSIX, relativo à raiz do repositório) do arquivo de um item. */
export function contentFilePath(collection: CollectionName, id: string): string {
  if (!isCollectionName(collection)) throw new Error(`Coleção desconhecida: ${String(collection)}`);
  if (!isValidContentId(id)) throw new Error(`Identificador inválido: ${JSON.stringify(id)}`);
  return `${CONTENT_DIR}/${collection}/${id}.json`;
}

/** Interpreta um caminho do repositório; `null` se estiver fora do permitido. */
export function parseContentFilePath(path: string): { collection: CollectionName; id: string } | null {
  const match = /^content\/([a-z]+)\/([^/]+)\.json$/.exec(path);
  if (!match) return null;
  const [, collection, id] = match;
  if (!collection || !id || !isCollectionName(collection) || !isValidContentId(id)) return null;
  return { collection, id };
}
