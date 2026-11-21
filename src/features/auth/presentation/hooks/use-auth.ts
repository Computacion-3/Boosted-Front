"use client";

import { useCallback } from "react";
import type { Permission } from "@/src/core/permissions";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { LoginFormValues } from "../schemas/login.schema";
import {
  clearAuthError,
  login as loginThunk,
  logout as logoutThunk,
  setUser,
} from "../store/auth.slice";
import type { AuthUserViewModel } from "../viewmodels/auth-user.viewmodel";

/**
 * Hook fachada de autenticación. Los componentes no ven Redux: reciben la
 * persona, el estado de carga, el error y funciones.
 *
 * hasRole y hasPermission solo sirven para mostrar u ocultar interfaz.
 * Ocultar un botón no es proteger: eso lo hacen el DAL y cada Server Action.
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

  /** Revoca el token, borra la cookie y vacía todo el store. Quien llama decide a dónde navegar. */
  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutThunk());
  }, [dispatch]);

  /** Lo usa AuthHydrator para cargar en Redux la sesión que leyó el servidor. */
  const hydrate = useCallback(
    (sessionUser: AuthUserViewModel | null) => {
      dispatch(setUser(sessionUser));
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  /** true si la persona tiene ese rol (aficionado, moderador, administrador). */
  const hasRole = useCallback((role: string) => user?.role === role, [user]);

  /** true si la persona tiene ese permiso (`recurso:acción`; usa las constantes de PERMISSIONS). */
  const hasPermission = useCallback(
    (permission: Permission) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  return {
    user,
    isAuthenticated: user !== null,
    isLoading: status === "loading",
    errorMessage,
    login,
    logout,
    hydrate,
    clearError,
    hasRole,
    hasPermission,
  };
}
