"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { LoginFormValues } from "../schemas/login.schema";
import { clearAuthError, login as loginThunk } from "../store/auth.slice";

/**
 * Hook fachada de autenticación. Los componentes no ven Redux: reciben la
 * persona, el estado de carga, el error y funciones.
 *
 * Por ahora cubre el login (#9). El #11 agrega hidratar la sesión al recargar,
 * register, logout, hasRole y hasPermission.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, errorMessage } = useAppSelector((state) => state.auth);

  /** Devuelve true si inició sesión; si no, el mensaje queda en `errorMessage`. */
  const login = useCallback(
    async (values: LoginFormValues): Promise<boolean> => {
      const result = await dispatch(loginThunk(values));
      return loginThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    isLoading: status === "loading",
    errorMessage,
    login,
    clearError,
  };
}
