"use client";

import { useEffect, useState } from "react";
import { Button, classNames, FormField } from "@/src/core/components/ui";
import type { PostFilters } from "../../domain/repositories/post.repository";
import { getVehicleIdError, POST_TYPE_OPTIONS } from "../viewmodels/post.viewmodel";

export type PostFiltersBarProps = {
  /** Filtros aplicados ahora (los del hook). */
  value: PostFilters;
  onChange: (filters: PostFilters) => void;
};

const DEBOUNCE_MS = 400;

type PostType = NonNullable<PostFilters["types"]>[number];

/** Lo que la persona ve en los campos mientras escribe, antes de que se aplique. */
type Draft = { search: string; types: PostType[]; authorId: string; vehicleId: string };

const EMPTY_DRAFT: Draft = { search: "", types: [], authorId: "", vehicleId: "" };

const toDraft = (filters: PostFilters): Draft => ({
  search: filters.search ?? "",
  types: filters.types ?? [],
  authorId: filters.authorId ?? "",
  vehicleId: filters.vehicleId ?? "",
});

const toFilters = (draft: Draft): PostFilters => ({
  search: draft.search.trim() || undefined,
  types: draft.types.length > 0 ? draft.types : undefined,
  authorId: draft.authorId.trim() || undefined,
  vehicleId: draft.vehicleId.trim() || undefined,
});

// Los tipos se comparan sin importar el orden en que se marcaron.
const sameTypes = (a: PostType[] = [], b: PostType[] = []) =>
  a.length === b.length && a.every((type) => b.includes(type));

const sameFilters = (a: PostFilters, b: PostFilters) =>
  a.search === b.search &&
  a.authorId === b.authorId &&
  a.vehicleId === b.vehicleId &&
  sameTypes(a.types, b.types);

/**
 * Filtros reactivos: se aplican solos mientras la persona escribe o marca tipos,
 * con una pequeña espera (debounce) para no pedir a la API una consulta por cada tecla.
 */
export function PostFiltersBar({ value, onChange }: PostFiltersBarProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(value));
  const [seenValue, setSeenValue] = useState<PostFilters>(value);

  // Si los filtros cambian desde afuera (un atajo de la tarjeta, «Limpiar filtros» del estado
  // vacío), los campos los siguen. Se ajusta durante el render y no en un efecto, para no pintar
  // un cuadro con los campos viejos. Se compara por contenido: el objeto cambia de identidad.
  if (!sameFilters(value, seenValue)) {
    setSeenValue(value);
    if (!sameFilters(value, toFilters(draft))) setDraft(toDraft(value));
  }

  // La API rechaza un vehicleId que no sea UUID: se avisa y no se consulta.
  const vehicleError = getVehicleIdError(draft.vehicleId);

  useEffect(() => {
    if (vehicleError) return;
    const next = toFilters(draft);
    if (sameFilters(next, value)) return;

    const timer = setTimeout(() => onChange(next), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, vehicleError, value, onChange]);

  const updateText = (field: "search" | "authorId" | "vehicleId") =>
    (event: { target: { value: string } }) =>
      setDraft((current) => ({ ...current, [field]: event.target.value }));

  const toggleType = (type: PostType) =>
    setDraft((current) => ({
      ...current,
      types: current.types.includes(type)
        ? current.types.filter((selected) => selected !== type)
        : [...current.types, type],
    }));

  const clear = () => {
    setDraft(EMPTY_DRAFT);
    onChange({});
  };

  const hasFilters = Boolean(
    draft.search || draft.types.length > 0 || draft.authorId || draft.vehicleId,
  );

  return (
    <form
      role="search"
      aria-label="Filtrar publicaciones"
      className="flex flex-col gap-4 rounded-box bg-base-100 p-4 shadow-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField
          label="Buscar"
          name="search"
          type="search"
          placeholder="Ej: turbo, aceite, suspensión…"
          autoComplete="off"
          value={draft.search}
          onChange={updateText("search")}
          className="sm:col-span-2"
        />
        <FormField
          label="ID del autor"
          name="authorId"
          autoComplete="off"
          spellCheck={false}
          hint="Usa «Más de este autor» en una tarjeta"
          value={draft.authorId}
          onChange={updateText("authorId")}
        />
        <FormField
          label="ID del vehículo"
          name="vehicleId"
          placeholder="Ej: 550e8400-e29b-41d4…"
          autoComplete="off"
          spellCheck={false}
          hint="Usa «Más de este vehículo» en una tarjeta"
          value={draft.vehicleId}
          onChange={updateText("vehicleId")}
          error={vehicleError}
        />
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Tipo</legend>
        <div className="flex flex-wrap gap-2">
          {POST_TYPE_OPTIONS.map(({ value: type, label }) => {
            const isSelected = draft.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleType(type)}
                className={classNames("btn btn-sm rounded-full", isSelected ? "btn-primary" : "btn-outline")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {hasFilters && (
        <div>
          <Button variant="ghost" size="sm" onClick={clear}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </form>
  );
}
