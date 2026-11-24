"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Alert } from "@/src/core/components/ui";
import type { ConnectionStatus } from "../../domain/repositories/notifications.repository";
import {
  formatRelativeTime,
  formatUnreadBadge,
  type NotificationViewModel,
} from "../viewmodels/notification.viewmodel";

export type NotificationBellProps = {
  items: NotificationViewModel[];
  unreadCount: number;
  connection: ConnectionStatus;
  errorMessage: string | null;
  onMarkAllRead: () => void;
};

export function NotificationBell({
  items,
  unreadCount,
  connection,
  errorMessage,
  onMarkAllRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Se fija al abrir el panel: no se llama a Date.now() durante el render.
  const [now, setNow] = useState(0);
  const panelId = useId();
  const titleId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = () => setIsOpen(false);

  // Clic fuera del panel y tecla Escape: los listeners existen solo mientras el panel está
  // abierto. Escape se escucha en el documento y no en el contenedor, porque con Tab el foco
  // puede salir del panel (al menú de usuario, por ejemplo) y Escape debe cerrarlo igual.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Si el foco estaba dentro del panel, vuelve a la campana; si ya estaba en otro lado, se queda.
      if (wrapperRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen) setNow(Date.now());
    setIsOpen((open) => !open);
  };

  const hasUnread = unreadCount > 0;
  const label = hasUnread
    ? `Notificaciones, ${unreadCount} sin leer`
    : "Notificaciones";
  const liveText = hasUnread
    ? `${unreadCount} ${unreadCount === 1 ? "notificación sin leer" : "notificaciones sin leer"}`
    : "";

  return (
    // data-connection no cambia nada visible: lo leen las pruebas E2E para saber cuándo el socket
    // ya está conectado (los avisos no se guardan, así que antes de eso se perderían).
    <div ref={wrapperRef} className="relative" data-connection={connection}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost btn-circle transition-transform active:scale-[0.98] motion-reduce:transition-none"
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="indicator">
          {hasUnread && (
            <span
              className="indicator-item badge badge-primary badge-sm"
              aria-hidden="true"
            >
              {formatUnreadBadge(unreadCount)}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {liveText}
      </span>

      {isOpen && (
        <section
          id={panelId}
          aria-labelledby={titleId}
          className="fixed inset-x-2 top-16 z-20 rounded-box border border-base-300 bg-base-100 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex max-h-[min(26rem,calc(100dvh-5rem))] flex-col">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <p id={titleId} className="text-sm font-semibold">
                Notificaciones
              </p>
              {/*
                aria-disabled y no disabled: un botón disabled pierde el foco del teclado, y este se
                deshabilita justo al pulsarlo (el contador pasa a cero).
              */}
              <button
                type="button"
                className={`btn btn-ghost btn-xs ${hasUnread ? "" : "btn-disabled"}`}
                aria-disabled={!hasUnread || undefined}
                onClick={() => {
                  if (hasUnread) onMarkAllRead();
                }}
              >
                Marcar como leídas
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain p-1">
              {connection === "connecting" && (
                <p
                  role="status"
                  className="px-3 py-2 text-xs text-base-content/70"
                >
                  Reconectando…
                </p>
              )}
              {connection === "error" && (
                <Alert variant="warning" className="m-2">
                  {errorMessage ??
                    "No se pudo conectar para recibir notificaciones. Recarga la página o vuelve a iniciar sesión."}
                </Alert>
              )}

              {items.length > 0 ? (
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        // Con Ctrl, Cmd o Shift el enlace se abre en otra pestaña o ventana: el panel
                        // se queda abierto para poder abrir varias notificaciones seguidas.
                        onClick={(event) => {
                          if (!event.metaKey && !event.ctrlKey && !event.shiftKey) close();
                        }}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                      >
                        {item.isRead ? (
                          <span className="mt-1.5 size-2 shrink-0" aria-hidden="true" />
                        ) : (
                          <span
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block break-words text-sm ${
                              item.isRead
                                ? "text-base-content/80"
                                : "font-semibold"
                            }`}
                          >
                            {!item.isRead && <span className="sr-only">Sin leer. </span>}
                            {item.message}
                          </span>
                          <time
                            dateTime={item.createdAt}
                            title={item.timeLabel}
                            className="mt-0.5 block text-xs text-base-content/70"
                          >
                            {formatRelativeTime(item.createdAt, now)}
                          </time>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                connection !== "error" && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-medium">Aún no tienes notificaciones.</p>
                    <p className="mt-1 text-sm text-base-content/70">
                      Aquí aparecerán los likes y comentarios de tus publicaciones.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
