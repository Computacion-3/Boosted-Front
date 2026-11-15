"use client";

import { useEffect, useState } from "react";
import { Button, FormField, SelectField } from "@/src/core/components/ui";
import type { EventFilters } from "../../domain/repositories/event.repository";
import { EVENT_TYPE_OPTIONS } from "../viewmodels/event.viewmodel";

export type EventFiltersBarProps = {
  /** Filtros aplicados ahora (los del hook). */
  value: EventFilters;
  onChange: (filters: EventFilters) => void;
};

const DEBOUNCE_MS = 400;

type Draft = { city: string; type: string; startDate: string; endDate: string };

const toDraft = (filters: EventFilters): Draft => ({
  city: filters.city ?? "",
  type: filters.type ?? "",
  startDate: filters.startDate ?? "",
  endDate: filters.endDate ?? "",
});

const toFilters = (draft: Draft): EventFilters => ({
  city: draft.city.trim() || undefined,
  type: (draft.type || undefined) as EventFilters["type"],
  startDate: draft.startDate || undefined,
  endDate: draft.endDate || undefined,
});

const sameFilters = (a: EventFilters, b: EventFilters) =>
  a.city === b.city && a.type === b.type && a.startDate === b.startDate && a.endDate === b.endDate;

/**
 * Filtros reactivos: se aplican solos mientras la persona escribe, con una
 * pequeña espera (debounce) para no pedir a la API una consulta por cada tecla.
 */
export function EventFiltersBar({ value, onChange }: EventFiltersBarProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(value));

  // Si la fecha inicial es posterior a la final, se avisa y no se consulta (la API respondería 400).
  const dateError =
    draft.startDate && draft.endDate && draft.startDate > draft.endDate
      ? "La fecha inicial no puede ser posterior a la final"
      : undefined;

  useEffect(() => {
    if (dateError) return;
    const next = toFilters(draft);
    if (sameFilters(next, value)) return;

    const timer = setTimeout(() => onChange(next), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, dateError, value, onChange]);

  const update = (field: keyof Draft) => (event: { target: { value: string } }) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }));

  const hasFilters = Object.values(draft).some(Boolean);

  return (
    <form
      role="search"
      aria-label="Filtrar eventos"
      className="grid grid-cols-1 gap-x-4 rounded-box bg-base-100 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <FormField label="Ciudad" placeholder="Ej: Cali" value={draft.city} onChange={update("city")} />
      <SelectField
        label="Tipo"
        placeholder="Todos los tipos"
        options={EVENT_TYPE_OPTIONS}
        value={draft.type}
        onChange={update("type")}
      />
      <FormField label="Desde" type="date" value={draft.startDate} onChange={update("startDate")} />
      <FormField
        label="Hasta"
        type="date"
        value={draft.endDate}
        onChange={update("endDate")}
        error={dateError}
      />
      {hasFilters && (
        <div className="sm:col-span-2 lg:col-span-4">
          <Button variant="ghost" size="sm" onClick={() => setDraft(toDraft({}))}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </form>
  );
}
