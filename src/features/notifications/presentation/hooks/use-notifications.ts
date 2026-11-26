"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { clearNotifications, markAllRead as markAllReadAction } from "../store/notifications.slice";

/**
 * Hook fachada de las notificaciones en tiempo real. Los componentes leen la lista, el
 * contador y el estado de la conexión desde aquí, sin tocar el store.
 */
export function useNotifications() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, connection, errorMessage } = useAppSelector(
    (state) => state.notifications,
  );

  const markAllRead = useCallback(() => {
    dispatch(markAllReadAction());
  }, [dispatch]);

  const clear = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return {
    items,
    unreadCount,
    isConnected: connection === "connected",
    connection,
    errorMessage,
    markAllRead,
    clear,
  };
}
