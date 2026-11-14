"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AlertVariant } from "@/src/core/components/ui/Alert";
import type { ToastMessage } from "@/src/core/components/ui/Toast";

const DEFAULT_DURATION_MS = 4000;

/**
 * Estado local de los toasts de una pantalla. Se usa junto con <ToastContainer>:
 *
 *   const { toasts, showToast, dismissToast } = useToast();
 *   showToast("Evento creado", "success");
 *   <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 *
 * Es estado de interfaz efímero (no de dominio), por eso no va en Redux.
 */
export function useToast(durationMs: number = DEFAULT_DURATION_MS) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: AlertVariant = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);

      const timer = setTimeout(() => {
        timers.current.delete(timer);
        dismissToast(id);
      }, durationMs);
      timers.current.add(timer);
    },
    [dismissToast, durationMs],
  );

  // Si la pantalla se desmonta, se cancelan los temporizadores pendientes.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return { toasts, showToast, dismissToast };
}
