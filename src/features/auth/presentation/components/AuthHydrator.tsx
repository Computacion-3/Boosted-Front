"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import type { AuthUserViewModel } from "../viewmodels/auth-user.viewmodel";

export type AuthHydratorProps = {
  /** La persona con sesión según la cookie (leída en el servidor), o null. */
  user: AuthUserViewModel | null;
};

/**
 * Componente invisible: al cargar o recargar la página, pasa a Redux la sesión
 * que el layout raíz leyó de la cookie. Sin él, Redux olvidaría a la persona en
 * cada recarga aunque la cookie siga vigente.
 */
export function AuthHydrator({ user }: AuthHydratorProps) {
  const { hydrate } = useAuth();

  useEffect(() => {
    hydrate(user);
  }, [hydrate, user]);

  return null;
}
