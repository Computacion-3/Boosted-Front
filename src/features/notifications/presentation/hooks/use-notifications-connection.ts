"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { startNotifications, stopNotifications } from "../store/notifications.slice";

/**
 * Abre o cierra la conexión en tiempo real según la sesión. Sigue a `state.auth.user`,
 * que llena `AuthHydrator` al cargar la página. No hay función de limpieza: conectar es
 * idempotente, así que el doble efecto de React en desarrollo no abre dos conexiones.
 */
export function useNotificationsConnection(): void {
  const dispatch = useAppDispatch();
  const isSignedIn = useAppSelector((state) => state.auth.user !== null);

  useEffect(() => {
    if (isSignedIn) dispatch(startNotifications());
    else dispatch(stopNotifications());
  }, [dispatch, isSignedIn]);
}
