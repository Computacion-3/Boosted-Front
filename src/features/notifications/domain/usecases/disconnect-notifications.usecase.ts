import type { NotificationsRepository } from "../repositories/notifications.repository";

/** Deja de recibir notificaciones y cierra la conexión (por ejemplo, al cerrar sesión). */
export class DisconnectNotificationsUseCase {
  constructor(private readonly repository: NotificationsRepository) {}

  execute(): void {
    this.repository.disconnect();
  }
}
