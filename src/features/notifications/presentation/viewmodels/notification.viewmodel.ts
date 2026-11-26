import type {
  NotificationType,
  UserNotification,
} from "../../domain/entities/user-notification";

/** Notificación lista para pintar: datos planos y serializables (van al estado de Redux). */
export interface NotificationViewModel {
  readonly id: string;
  readonly type: NotificationType;
  readonly message: string;
  readonly postId: string;
  readonly postTitle: string;
  /** Ruta de la publicación a la que lleva el aviso. */
  readonly href: string;
  /** Fecha en ISO (serializable). */
  readonly createdAt: string;
  /** Fecha y hora absolutas del evento (para el tooltip), p. ej. "23 nov, 03:45 p. m.". */
  readonly timeLabel: string;
  readonly isRead: boolean;
}

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const NotificationViewModelMapper = {
  toViewModel(notification: UserNotification): NotificationViewModel {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      postId: notification.postId,
      postTitle: notification.postTitle,
      href: `/posts/${encodeURIComponent(notification.postId)}`,
      createdAt: notification.createdAt.toISOString(),
      timeLabel: timeFormatter.format(notification.createdAt),
      isRead: false,
    };
  },
};

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "ahora", "hace 5 min", "hace 3 h", "hace 2 d". El número y la unidad van con un espacio que no se parte. */
export function formatRelativeTime(createdAtIso: string, now: number = Date.now()): string {
  const elapsed = now - new Date(createdAtIso).getTime();
  if (!(elapsed >= MINUTE_MS)) return "ahora"; // menos de 60 s, fechas futuras o inválidas
  if (elapsed < HOUR_MS) return `hace ${Math.floor(elapsed / MINUTE_MS)} min`;
  if (elapsed < DAY_MS) return `hace ${Math.floor(elapsed / HOUR_MS)} h`;
  return `hace ${Math.floor(elapsed / DAY_MS)} d`;
}

/** Texto de la insignia de no leídas: "7" o "99+". */
export function formatUnreadBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}
