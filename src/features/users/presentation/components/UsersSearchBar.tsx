"use client";

import { useEffect, useRef, useState } from "react";
import { FormField } from "@/src/core/components/ui";

export type UsersSearchBarProps = {
  /** Búsqueda aplicada ahora mismo. */
  value: string;
  onSearch: (text: string) => void;
};

/** Espera tras la última tecla antes de buscar: así no se hace una búsqueda por letra. */
const DEBOUNCE_MS = 400;

/** Búsqueda reactiva por nombre, usuario o correo. */
export function UsersSearchBar({ value, onSearch }: UsersSearchBarProps) {
  const [text, setText] = useState(value);
  const lastSent = useRef(value);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === lastSent.current) return;

    const timer = setTimeout(() => {
      lastSent.current = trimmed;
      onSearch(trimmed);
    }, DEBOUNCE_MS);
    // Si la persona sigue escribiendo, se cancela la búsqueda pendiente.
    return () => clearTimeout(timer);
  }, [text, onSearch]);

  return (
    <FormField
      label="Buscar"
      type="search"
      placeholder="Nombre, usuario o correo"
      value={text}
      onChange={(event) => setText(event.target.value)}
      className="max-w-md"
    />
  );
}
