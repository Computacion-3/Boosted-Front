import type {
  NotificationsListener,
  NotificationsRepository,
} from "../repositories/notifications.repository";

/** Empieza a recibir las notificaciones del usuario en tiempo real. */
export class ConnectNotificationsUseCase {
  constructor(private readonly repository: NotificationsRepository) {}

  execute(listener: NotificationsListener): void {
    this.repository.connect(listener);
  }
}
