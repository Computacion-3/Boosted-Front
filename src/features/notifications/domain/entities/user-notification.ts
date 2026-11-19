import { DomainError } from "@/src/core/errors";

export type NotificationType = "post.liked" | "post.commented";

export interface UserNotificationProps {
  id: string;
  type: NotificationType;
  postId: string;
  postTitle: string;
  actorId: string;
  actorName: string;
  message: string;
  createdAt: Date;
}

/**
 * Aviso para el autor de una publicación: alguien le dio like o la comentó.
 * Solo existe en tiempo real: el backend no las guarda.
 */
export class UserNotification {
  readonly id: string;
  readonly type: NotificationType;
  readonly postId: string;
  readonly postTitle: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly message: string;
  readonly createdAt: Date;

  constructor(props: UserNotificationProps) {
    if (!props.id) {
      throw new DomainError("La notificación no tiene identificador");
    }
    if (!props.postId) {
      throw new DomainError("La notificación no indica la publicación");
    }
    if (Number.isNaN(props.createdAt.getTime())) {
      throw new DomainError("La notificación tiene una fecha inválida");
    }
    this.id = props.id;
    this.type = props.type;
    this.postId = props.postId;
    this.postTitle = props.postTitle;
    this.actorId = props.actorId;
    this.actorName = props.actorName;
    this.message = props.message;
    this.createdAt = props.createdAt;
  }
}
