import { io, type Socket } from "socket.io-client";
import type { ConnectionStatus } from "../../domain/repositories/notifications.repository";
import { parseNotificationDto } from "../dtos/notification.dto";
import type {
  NotificationsSocketDatasource,
  NotificationsSocketHandlers,
} from "./notifications-socket-datasource.interface";
import type { TicketResult } from "./socket-ticket-datasource";

const NOTIFICATION_EVENT = "notification";

// Con este mensaje el backend rechaza el handshake de una cuenta desactivada
// o borrada (sección 13.10 del README de `Boosted`). Reintentar no sirve.
const ACCOUNT_UNAVAILABLE = "Cuenta no disponible";

const MESSAGES = {
  noUrl: "El servidor de notificaciones no está configurado.",
  sessionEnded: "Tu sesión terminó. Inicia sesión de nuevo para ver tus notificaciones.",
  accountUnavailable: "Tu cuenta no está disponible.",
} as const;

export interface NotificationsSocketIoConfig {
  /** `NEXT_PUBLIC_WS_URL`. Vacía si falta: `connect` termina en `error` en vez de lanzar. */
  url: string;
  /** Un ticket nuevo en cada llamada: el del backend sirve una sola vez. */
  getTicket: () => Promise<TicketResult>;
  /** Espera antes del primer reintento (se duplica en cada intento). */
  retryDelayMs?: number;
  /** Tope de la espera entre reintentos. */
  retryMaxDelayMs?: number;
}

const DEFAULT_RETRY_DELAY_MS = 1_000;
const DEFAULT_RETRY_MAX_DELAY_MS = 30_000;

/** Espera creciente: base, 2×base, 4×base… hasta el tope. */
export function retryDelay(attempt: number, baseMs: number, maxMs: number): number {
  return Math.min(baseMs * 2 ** attempt, maxMs);
}

/**
 * Canal de notificaciones sobre socket.io-client. Corre solo en el navegador:
 * `connect` es lo único que abre una conexión y se llama desde un efecto.
 *
 * La reconexión la manejamos nosotros (`reconnection: false` en socket.io) y
 * no la librería, por dos razones:
 * - Un fallo del handshake (ticket vencido o usado) es un `connect_error` que
 *   socket.io NO reintenta solo, y uno de red sí. Así hay un único camino.
 * - Cada intento crea un socket nuevo, y su `auth` pide un ticket nuevo.
 *
 * Cuándo se reintenta y cuándo no vive en `fail`.
 */
export class NotificationsSocketIoDatasource implements NotificationsSocketDatasource {
  private socket: Socket | null = null;
  private handlers: NotificationsSocketHandlers | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private status: ConnectionStatus = "idle";
  private errorMessage: string | undefined;

  constructor(private readonly config: NotificationsSocketIoConfig) {}

  connect(handlers: NotificationsSocketHandlers): void {
    this.handlers = handlers;
    // `connecting` cubre también la espera entre reintentos.
    if (this.status === "connecting" || this.status === "connected") return;

    if (!this.config.url) {
      this.setStatus("error", MESSAGES.noUrl);
      return;
    }
    this.attempt = 0;
    this.open();
  }

  disconnect(): void {
    this.stopWaiting();
    this.closeSocket();
    this.setStatus("idle");
    this.handlers = null;
  }

  private open(): void {
    const socket = io(this.config.url, {
      autoConnect: false,
      forceNew: true,
      reconnection: false,
      // socket.io la ejecuta en cada conexión: así cada intento lleva su ticket.
      auth: (send) => {
        void this.sendTicket(socket, send);
      },
    });
    this.socket = socket;

    socket.on("connect", () => {
      this.attempt = 0;
      this.setStatus("connected");
    });
    socket.on(NOTIFICATION_EVENT, (payload: unknown) => {
      const dto = parseNotificationDto(payload);
      if (dto) this.handlers?.onNotification(dto);
    });
    // El handshake rechazado y la red caída llegan los dos por aquí.
    socket.on("connect_error", (error) => {
      this.fail(error.message === ACCOUNT_UNAVAILABLE ? "account" : "retry");
    });
    // Conexión perdida estando conectado. Lo que cerramos nosotros no llega aquí:
    // `closeSocket` quita los oyentes antes de desconectar.
    socket.on("disconnect", () => this.fail("retry"));

    this.setStatus("connecting");
    socket.connect();
  }

  private async sendTicket(socket: Socket, send: (data: object) => void): Promise<void> {
    const result = await this.config.getTicket();
    // Mientras esperábamos pudo llamarse `disconnect` o empezar otro intento.
    if (this.socket !== socket) return;

    if (result.ok) {
      send({ ticket: result.ticket });
    } else {
      this.fail(result.reason === "unauthenticated" ? "session" : "retry");
    }
  }

  /** Única decisión de reintentar o rendirse. */
  private fail(outcome: "retry" | "session" | "account"): void {
    this.closeSocket();
    if (outcome === "session") {
      this.setStatus("error", MESSAGES.sessionEnded);
    } else if (outcome === "account") {
      this.setStatus("error", MESSAGES.accountUnavailable);
    } else {
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    this.setStatus("connecting");
    const delay = retryDelay(
      this.attempt,
      this.config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS,
      this.config.retryMaxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS,
    );
    this.attempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, delay);
  }

  private stopWaiting(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
  }

  private setStatus(status: ConnectionStatus, errorMessage?: string): void {
    if (status === this.status && errorMessage === this.errorMessage) return;
    this.status = status;
    this.errorMessage = errorMessage;
    this.handlers?.onConnectionChange(status, errorMessage);
  }
}
