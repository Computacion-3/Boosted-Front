"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { hidePost, restorePost } from "../store/posts.slice";

/**
 * Hook fachada de la moderación de publicaciones (ocultar y restaurar).
 * El resultado (éxito o error) llega como aviso desde el store: `usePostsToast` lo muestra.
 */
export function usePostModeration(): {
  isSubmitting: boolean;
  hide: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector((state) => state.posts.mutation.status === "submitting");

  const hide = useCallback(
    async (id: string) => {
      await dispatch(hidePost(id));
    },
    [dispatch],
  );

  const restore = useCallback(
    async (id: string) => {
      await dispatch(restorePost(id));
    },
    [dispatch],
  );

  return { isSubmitting, hide, restore };
}
