import type {
  NotificationsListener,
  NotificationsRepository,
} from "../../domain/repositories/notifications.repository";
import type { UserNotification } from "../../domain/entities/user-notification";
import type { NotificationsSocketDatasource } from "../datasources/notifications-socket-datasource.interface";
import { NotificationMapper } from "../mappers/notification.mapper";

export class NotificationsRepositoryImpl implements NotificationsRepository {
  constructor(private readonly datasource: NotificationsSocketDatasource) {}

  connect(listener: NotificationsListener): void {
    this.datasource.connect({
      onNotification: (dto) => {
        let notification: UserNotification;
        try {
          notification = NotificationMapper.toDomain(dto);
        } catch {
          // Un evento que no cumple el contrato se ignora: no debe tumbar el flujo.
          return;
        }
        listener.onNotification(notification);
      },
      onConnectionChange: (status, errorMessage) =>
        listener.onConnectionChange(status, errorMessage),
    });
  }

  disconnect(): void {
    this.datasource.disconnect();
  }
}
