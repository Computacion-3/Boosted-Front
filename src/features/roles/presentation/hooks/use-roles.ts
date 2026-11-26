"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { clearRolesFeedback, fetchRolesOverview, saveRolePermissions } from "../store/roles.slice";

/** Hook fachada de roles y permisos: auditoría y edición, sin que los componentes vean Redux. */
export function useRoles() {
  const dispatch = useAppDispatch();
  const { roles, permissions, status, errorMessage, savingRole, saveError, savedRole } = useAppSelector(
    (state) => state.roles,
  );

  // La carga necesita una sesión: al cerrar sesión el store vuelve a `idle` con la cookie ya
  // borrada, y recargar entonces dejaría el slice en `failed` en vez de vacío.
  const isSignedIn = useAppSelector((state) => state.auth.user !== null);

  useEffect(() => {
    if (isSignedIn && status === "idle") dispatch(fetchRolesOverview());
  }, [dispatch, isSignedIn, status]);

  const reload = useCallback(() => {
    dispatch(fetchRolesOverview());
  }, [dispatch]);

  /** Devuelve true si se guardó; si no, el motivo queda en `saveError`. */
  const savePermissions = useCallback(
    async (role: string, rolePermissions: string[]) => {
      const result = await dispatch(saveRolePermissions({ role, permissions: rolePermissions }));
      return saveRolePermissions.fulfilled.match(result);
    },
    [dispatch],
  );

  const clearFeedback = useCallback(() => {
    dispatch(clearRolesFeedback());
  }, [dispatch]);

  return {
    roles,
    permissions,
    isLoading: status === "loading" || status === "idle",
    errorMessage,
    savingRole,
    saveError,
    savedRole,
    reload,
    savePermissions,
    clearFeedback,
  };
}
