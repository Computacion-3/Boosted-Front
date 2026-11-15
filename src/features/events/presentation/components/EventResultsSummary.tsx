export type EventResultsSummaryProps = {
  page: number;
  limit: number;
  total: number;
};

/** "Mostrando 11–20 de 37 eventos" */
export function EventResultsSummary({ page, limit, total }: EventResultsSummaryProps) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <p className="text-sm text-base-content/70" aria-live="polite">
      Mostrando {from}–{to} de {total} {total === 1 ? "evento" : "eventos"}
    </p>
  );
}
