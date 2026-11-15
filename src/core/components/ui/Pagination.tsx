import { classNames } from "./class-names";

export type PaginationProps = {
  /** Página actual, desde 1 (igual que la API). */
  page: number;
  /** Total de elementos que cumplen los filtros (no solo los de esta página). */
  total: number;
  /** Elementos por página. */
  limit: number;
  onChange: (page: number) => void;
};

const GAP = "…";

/**
 * Números a mostrar: siempre la primera y la última página, y la actual con una
 * vecina a cada lado. Ejemplo con 10 páginas en la 5: [1, "…", 4, 5, 6, "…", 10].
 */
export function getPageItems(page: number, totalPages: number): Array<number | typeof GAP> {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items: Array<number | typeof GAP> = [];
  sorted.forEach((p, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && p - previous > 1) items.push(GAP);
    items.push(p);
  });
  return items;
}

/**
 * Paginación numérica. No se muestra si todo cabe en una sola página.
 * No usa la clase `join` de daisyUI: su CSS (@scope) rompe `next dev` con Turbopack.
 */
export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <nav aria-label="Paginación" className="flex justify-center">
      <div className="flex flex-wrap justify-center gap-1">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          «
        </button>
        {items.map((item, index) =>
          item === GAP ? (
            <span key={`gap-${index}`} className="btn btn-sm btn-disabled" aria-hidden="true">
              {GAP}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={classNames("btn btn-sm", item === page && "btn-active btn-primary")}
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Página ${item}`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          »
        </button>
      </div>
    </nav>
  );
}
