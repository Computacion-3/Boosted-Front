/** Ruta same-origin que cambia la cookie de sesión por un ticket del WebSocket. */
export const SOCKET_TICKET_ENDPOINT = "/api/realtime/ticket";

const TICKET_TIMEOUT_MS = 10_000;

/**
 * - `unauthenticated`: no hay sesión (401). Reintentar no sirve.
 * - `unavailable`: el servidor no respondió o falló. Vale la pena reintentar.
 */
export type TicketResult =
  | { ok: true; ticket: string }
  | { ok: false; reason: "unauthenticated" | "unavailable" };

/**
 * Pide un ticket de un solo uso (vence a los 60 s). El navegador no puede
 * leer la cookie httpOnly ni llamar a la API con el Bearer, así que pasa por
 * un Route Handler de Next que sí lo hace. Se llama en cada intento de
 * conexión, porque un ticket no se puede reutilizar.
 */
export async function requestSocketTicket(): Promise<TicketResult> {
  try {
    const response = await fetch(SOCKET_TICKET_ENDPOINT, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(TICKET_TIMEOUT_MS),
    });
    if (response.status === 401) return { ok: false, reason: "unauthenticated" };
    if (!response.ok) return { ok: false, reason: "unavailable" };

    const body: unknown = await response.json();
    const ticket =
      typeof body === "object" && body !== null
        ? (body as { ticket?: unknown }).ticket
        : undefined;
    if (typeof ticket !== "string" || ticket === "") {
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, ticket };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
