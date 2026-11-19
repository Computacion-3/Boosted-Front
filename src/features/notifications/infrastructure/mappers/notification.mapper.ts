import { DomainError } from "@/src/core/errors";
import {
  UserNotification,
  type NotificationType,
} from "../../domain/entities/user-notification";
import type { NotificationDto } from "../dtos/notification.dto";

const KNOWN_TYPES: readonly NotificationType[] = ["post.liked", "post.commented"];

function isNotificationType(value: string): value is NotificationType {
  return (KNOWN_TYPES as readonly string[]).includes(value);
}

export class NotificationMapper {
  /** Lanza `DomainError` si el DTO no cumple el contrato (tipo desconocido, fecha inválida…). */
  static toDomain(dto: NotificationDto): UserNotification {
    if (!isNotificationType(dto.type)) {
      throw new DomainError(`Tipo de notificación desconocido: ${dto.type}`);
    }
    return new UserNotification({
      id: dto.id,
      type: dto.type,
      postId: dto.postId,
      postTitle: dto.postTitle,
      actorId: dto.actorId,
      actorName: dto.actorName,
      message: dto.message,
      createdAt: new Date(dto.createdAt),
    });
  }
}
