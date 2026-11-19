import type { ConnectionStatus } from "../../domain/repositories/notifications.repository";
import type { NotificationDto } from "../dtos/notification.dto";

export interface NotificationsSocketHandlers {
  onNotification(dto: NotificationDto): void;
  onConnectionChange(status: ConnectionStatus, errorMessage?: string): void;
}

/**
 * Contrato del canal en tiempo real. Habla en DTO y en estados de conexión;
 * cómo se llega al servidor (socket.io, otro cliente, un falso para pruebas)
 * es asunto de cada implementación.
 */
export interface NotificationsSocketDatasource {
  /** Idempotente: con una conexión en curso solo reemplaza los manejadores. */
  connect(handlers: NotificationsSocketHandlers): void;
  /** Cierra todo y deja el estado en `idle`. Se puede volver a llamar a `connect`. */
  disconnect(): void;
}
