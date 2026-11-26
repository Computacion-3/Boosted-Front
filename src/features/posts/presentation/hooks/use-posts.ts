"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { PostFilters } from "../../domain/repositories/post.repository";
import { fetchPosts, togglePostLike } from "../store/posts.slice";

/**
 * Hook fachada del feed de publicaciones. Los componentes no ven Redux: reciben
 * las publicaciones y funciones para filtrar, paginar y recargar. También
 * maneja los likes: expone qué publicaciones están en curso y la acción de dar o
 * quitar like. Los avisos (éxito o error) viven en `usePostsToast`.
 */
export function usePosts() {
  const dispatch = useAppDispatch();
  const { query, items, total, status, errorMessage } = useAppSelector((state) => state.posts.list);
  const { types, authorId, vehicleId, search, limit } = query;
  // Selectores separados: el feed no se vuelve a renderizar por cambios ajenos.
  const likingIds = useAppSelector((state) => state.posts.likingIds);

  // La carga necesita una sesión: al cerrar sesión el store vuelve a `idle` con la cookie ya
  // borrada, y recargar entonces dejaría la lista en `failed` en vez de vacía.
  const isSignedIn = useAppSelector((state) => state.auth.user !== null);

  // Primera carga: solo con el estado en "idle", así una lista vacía no dispara otra consulta.
  useEffect(() => {
    if (isSignedIn && status === "idle") dispatch(fetchPosts(query));
  }, [dispatch, isSignedIn, status, query]);

  // Se memoriza para que los componentes vean el mismo objeto mientras los filtros no cambien.
  const filters = useMemo<PostFilters>(
    () => ({ types, authorId, vehicleId, search }),
    [types, authorId, vehicleId, search],
  );

  const hasFilters = Boolean(types?.length || authorId || vehicleId || search);

  /** Cambiar filtros vuelve a la página 1. */
  const applyFilters = useCallback(
    (next: PostFilters) => {
      dispatch(fetchPosts({ ...next, page: 1, limit }));
    },
    [dispatch, limit],
  );

  const goToPage = useCallback(
    (page: number) => {
      dispatch(fetchPosts({ ...query, page }));
    },
    [dispatch, query],
  );

  /** Atajo de la tarjeta: «más publicaciones de este autor». */
  const filterByAuthor = useCallback(
    (id: string) => applyFilters({ ...filters, authorId: id }),
    [applyFilters, filters],
  );

  /** Atajo de la tarjeta: «más publicaciones de este vehículo». */
  const filterByVehicle = useCallback(
    (id: string) => applyFilters({ ...filters, vehicleId: id }),
    [applyFilters, filters],
  );

  const reload = useCallback(() => {
    dispatch(fetchPosts(query));
  }, [dispatch, query]);

  /** Da o quita el like de una publicación. */
  const toggleLike = useCallback(
    (postId: string) => {
      dispatch(togglePostLike(postId));
    },
    [dispatch],
  );

  return {
    posts: items,
    total,
    page: query.page,
    limit,
    filters,
    hasFilters,
    isLoading: status === "loading" || status === "idle",
    errorMessage,
    applyFilters,
    goToPage,
    filterByAuthor,
    filterByVehicle,
    reload,
    likingIds,
    toggleLike,
  };
}
