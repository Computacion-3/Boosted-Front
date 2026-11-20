"use client";

import { useCallback, useEffect } from "react";
import type { ToastMessage } from "@/src/core/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { dismissFeedback } from "../store/posts.slice";

const TOAST_DURATION_MS = 4000;

/**
 * Hook fachada de los avisos de publicaciones. El mensaje vive en Redux, así sobrevive a
 * una navegación (por ejemplo tras crear una publicación) y lo muestra la pantalla de
 * destino. El toast se deriva directamente del store y se descarta solo a los 4 segundos;
 * el temporizador se rehace en cada montaje, por eso funciona también con el modo estricto
 * de React (que monta, desmonta y vuelve a montar al desarrollar).
 */
export function usePostsToast(view: "feed" | "detail"): {
  toasts: ToastMessage[];
  dismissToast: (id: number) => void;
} {
  const dispatch = useAppDispatch();
  const feedback = useAppSelector((state) => state.posts.feedback);

  // Un aviso dirigido a otra pantalla se queda en el store hasta que esa pantalla se monte.
  const current = feedback && (!feedback.target || feedback.target === view) ? feedback : null;
  const currentId = current?.id ?? null;

  useEffect(() => {
    if (currentId === null) return;
    const timer = setTimeout(() => dispatch(dismissFeedback()), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [currentId, dispatch]);

  const dismissToast = useCallback(() => {
    dispatch(dismissFeedback());
  }, [dispatch]);

  // Solo hay un aviso a la vez, por eso el id del toast es fijo.
  const toasts: ToastMessage[] = current
    ? [{ id: 1, message: current.message, variant: current.tone }]
    : [];

  return { toasts, dismissToast };
}
