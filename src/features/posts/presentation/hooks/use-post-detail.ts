"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchPost, togglePostLike } from "../store/posts.slice";
import type { PostViewModel } from "../viewmodels/post.viewmodel";

/**
 * Hook fachada del detalle de una publicación. Pide la publicación al entrar y
 * cuando cambia el id; los componentes solo reciben datos y callbacks.
 */
export function usePostDetail(id: string): {
  post: PostViewModel | null;
  isLoading: boolean;
  errorMessage: string | null;
  isLiking: boolean;
  toggleLike: () => void;
  reload: () => void;
} {
  const dispatch = useAppDispatch();
  const detail = useAppSelector((state) => state.posts.detail);
  const isLiking = useAppSelector((state) => state.posts.likingIds.includes(id));

  // El detalle del store puede ser de otra publicación: solo se muestra la pedida.
  const post = detail.post?.id === id ? detail.post : null;

  // Una consulta nueva por visita; el guard evita reintentos solos tras un fallo.
  const requestedFor = useRef<string | null>(null);
  useEffect(() => {
    if (requestedFor.current === id) return;
    requestedFor.current = id;
    dispatch(fetchPost(id));
  }, [dispatch, id]);

  const reload = useCallback(() => {
    dispatch(fetchPost(id));
  }, [dispatch, id]);

  const toggleLike = useCallback(() => {
    dispatch(togglePostLike(id));
  }, [dispatch, id]);

  return {
    post,
    // Una recarga con la publicación ya en pantalla no la vacía.
    isLoading: post === null && (detail.status === "idle" || detail.status === "loading"),
    errorMessage: detail.errorMessage,
    isLiking,
    toggleLike,
    reload,
  };
}
