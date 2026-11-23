"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { UserRole, UserStatus } from "../../domain/entities/managed-user";
import {
  changeUserRole,
  changeUserStatus,
  clearUsersSaveError,
  fetchUsers,
} from "../store/users.slice";

/**
 * Hook fachada de la administración de usuarios. Los componentes no ven Redux:
 * reciben la página de usuarios y funciones para buscar, paginar y modificar.
 */
export function useUsers() {
  const dispatch = useAppDispatch();
  const { query, items, total, status, errorMessage, savingId, saveError } = useAppSelector(
    (state) => state.users,
  );

  // Primera carga.
  useEffect(() => {
    if (status === "idle") dispatch(fetchUsers(query));
  }, [dispatch, status, query]);

  /** Buscar vuelve a la página 1. */
  const search = useCallback(
    (text: string) => {
      dispatch(fetchUsers({ page: 1, limit: query.limit, search: text || undefined }));
    },
    [dispatch, query.limit],
  );

  const goToPage = useCallback(
    (page: number) => {
      dispatch(fetchUsers({ ...query, page }));
    },
    [dispatch, query],
  );

  const reload = useCallback(() => {
    dispatch(fetchUsers(query));
  }, [dispatch, query]);

  /** Devuelven true si el cambio se guardó; si no, el motivo queda en `saveError`. */
  const changeRole = useCallback(
    async (id: string, role: UserRole) => {
      const result = await dispatch(changeUserRole({ id, role }));
      return changeUserRole.fulfilled.match(result);
    },
    [dispatch],
  );

  const changeStatus = useCallback(
    async (id: string, newStatus: UserStatus) => {
      const result = await dispatch(changeUserStatus({ id, status: newStatus }));
      return changeUserStatus.fulfilled.match(result);
    },
    [dispatch],
  );

  const clearSaveError = useCallback(() => {
    dispatch(clearUsersSaveError());
  }, [dispatch]);

  return {
    users: items,
    total,
    page: query.page,
    limit: query.limit,
    search: query.search ?? "",
    isLoading: status === "loading" || status === "idle",
    errorMessage,
    savingId,
    saveError,
    onSearch: search,
    goToPage,
    reload,
    changeRole,
    changeStatus,
    clearSaveError,
  };
}
