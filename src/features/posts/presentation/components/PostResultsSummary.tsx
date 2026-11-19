export type PostResultsSummaryProps = {
  page: number;
  limit: number;
  total: number;
};

const numberFormatter = new Intl.NumberFormat("es-CO");

/** "Mostrando 11-20 de 37 publicaciones" */
export function PostResultsSummary({ page, limit, total }: PostResultsSummaryProps) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <p className="text-sm text-base-content/70 tabular-nums" aria-live="polite">
      Mostrando {numberFormatter.format(from)}-{numberFormatter.format(to)} de{" "}
      {numberFormatter.format(total)} {total === 1 ? "publicación" : "publicaciones"}
    </p>
  );
}
