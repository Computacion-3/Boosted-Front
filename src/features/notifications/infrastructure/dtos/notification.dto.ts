/**
 * Evento `notification` del WebSocket, tal como lo emite el backend
 * (sección 13.10 del README de `Boosted`). `type` llega como texto: el mapper
 * decide qué hacer con un valor que no conoce.
 */
export interface NotificationDto {
  id: string;
  type: string;
  postId: string;
  postTitle: string;
  actorId: string;
  actorName: string;
  message: string;
  createdAt: string;
}

const FIELDS = [
  "id",
  "type",
  "postId",
  "postTitle",
  "actorId",
  "actorName",
  "message",
  "createdAt",
] as const;

/**
 * Frontera con la red: lo que llega por el socket es `unknown`. Devuelve el
 * DTO si trae todos los campos como texto y `null` si no, para que un
 * evento mal formado se ignore en vez de romper la conexión.
 */
export function parseNotificationDto(value: unknown): NotificationDto | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (!FIELDS.every((field) => typeof record[field] === "string")) return null;
  return value as NotificationDto;
}
