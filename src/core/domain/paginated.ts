/**
 * Una página de resultados. Es la forma de dominio de `{ data, total, page, limit }`
 * que devuelve la API en los listados paginados.
 */
export interface Paginated<T> {
  readonly items: T[];
  /** Total de elementos que cumplen los filtros (no solo los de esta página). */
  readonly total: number;
  /** Página actual, desde 1. */
  readonly page: number;
  /** Elementos por página. */
  readonly limit: number;
}
