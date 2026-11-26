"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/src/core/hooks/use-toast";
import { EVENT_NOTICES, isEventNotice } from "../viewmodels/event-notice.viewmodel";

/**
 * Muestra como toast el aviso que vino en la URL (`?aviso=creado`) y lo quita
 * de la dirección para que no se repita al recargar. Devuelve lo que necesita <ToastContainer>.
 */
export function useEventNotice(notice: string | undefined) {
  const { toasts, showToast, dismissToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  // En desarrollo React ejecuta los efectos dos veces: el ref evita un toast doble.
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current || !isEventNotice(notice)) return;
    shown.current = true;
    showToast(EVENT_NOTICES[notice], "success");
    router.replace(pathname, { scroll: false });
  }, [notice, showToast, router, pathname]);

  return { toasts, dismissToast };
}
