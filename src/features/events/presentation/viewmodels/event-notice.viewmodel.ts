/**
 * Avisos que llegan en la URL después de guardar (`/events/123?aviso=creado`):
 * así el toast se muestra en la pantalla de destino aunque haya una navegación de por medio.
 */
export const EVENT_NOTICES = {
  creado: "Evento creado",
  actualizado: "Cambios guardados",
  eliminado: "Evento eliminado",
} as const;

export type EventNotice = keyof typeof EVENT_NOTICES;

export function isEventNotice(value: unknown): value is EventNotice {
  return typeof value === "string" && value in EVENT_NOTICES;
}
