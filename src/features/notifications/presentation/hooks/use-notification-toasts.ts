"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/src/core/hooks/use-toast";
import type { ToastMessage } from "@/src/core/components/ui";
import { useAppSelector } from "@/src/store/hooks";

/**
 * Muestra un toast cuando llega una notificación nueva. Se guarda en una referencia el id
 * de la última vista (empezando por la que ya existía al montar), así remontar el header no
 * repite una notificación vieja y un evento duplicado no avisa dos veces.
 */
export function useNotificationToasts(): {
  toasts: ToastMessage[];
  dismissToast: (id: number) => void;
} {
  const { toasts, showToast, dismissToast } = useToast();
  const latest = useAppSelector((state) => state.notifications.items[0]);
  const latestId = latest?.id;
  const latestMessage = latest?.message;
  const lastSeenId = useRef(latestId);

  useEffect(() => {
    if (latestId !== undefined && latestId !== lastSeenId.current && latestMessage !== undefined) {
      showToast(latestMessage, "info");
    }
    lastSeenId.current = latestId;
  }, [latestId, latestMessage, showToast]);

  return { toasts, dismissToast };
}
