import type { UserNotification } from "../entities/user-notification";

/**
 * Estado de la conexión en tiempo real:
 * - `idle`: no se ha pedido conectar (o se desconectó a propósito).
 * - `connecting`: abriendo la conexión o esperando para reintentar.
 * - `connected`: recibiendo notificaciones.
 * - `error`: se dejó de intentar (sesión terminada, cuenta no disponible, mala configuración).
 */
export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

/** Lo que el dominio quiere enterarse del flujo; quien conecta lo implementa. */
export interface NotificationsListener {
  onNotification(notification: UserNotification): void;
  /** `errorMessage` (en español, listo para mostrar) solo viene con `error`. */
  onConnectionChange(status: ConnectionStatus, errorMessage?: string): void;
}

/** Puerto del flujo de notificaciones: no dice nada de sockets, tickets ni URLs. */
export interface NotificationsRepository {
  /** Idempotente: si ya hay una conexión en curso, solo cambia el oyente. */
  connect(listener: NotificationsListener): void;
  disconnect(): void;
}
