"use client";

import { useNotificationsConnection } from "../hooks/use-notifications-connection";

/**
 * Componente invisible: abre la conexión de notificaciones en tiempo real mientras
 * hay sesión y la cierra al salir.
 */
export function NotificationsConnector() {
  useNotificationsConnection();

  return null;
}
