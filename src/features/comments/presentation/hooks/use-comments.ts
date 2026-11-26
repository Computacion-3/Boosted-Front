"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  addComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "../store/comments.slice";
import type { CommentViewModel } from "../viewmodels/comment.viewmodel";

/**
 * Hook fachada de los comentarios de una publicación. Pide la lista al entrar y
 * cuando cambia el id; los componentes solo reciben datos y callbacks.
 * Las operaciones devuelven `true` si salieron bien (el error queda en el estado).
 */
export function useComments(postId: string): {
  comments: CommentViewModel[];
  count: number;
  isLoading: boolean;
  errorMessage: string | null;
  isAdding: boolean;
  addError: string | null;
  busyIds: string[];
  itemErrors: Record<string, string>;
  add: (content: string) => Promise<boolean>;
  update: (id: string, content: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  reload: () => void;
} {
  const dispatch = useAppDispatch();
  const storePostId = useAppSelector((state) => state.comments.postId);
  const items = useAppSelector((state) => state.comments.items);
  const status = useAppSelector((state) => state.comments.status);
  const storeError = useAppSelector((state) => state.comments.errorMessage);
  const isAdding = useAppSelector((state) => state.comments.adding.status === "submitting");
  const addError = useAppSelector((state) => state.comments.adding.errorMessage);
  const busyIds = useAppSelector((state) => state.comments.busyIds);
  const itemErrors = useAppSelector((state) => state.comments.itemErrors);

  // El store puede tener los comentarios de otra publicación: solo se muestran los de esta.
  const matches = storePostId === postId;
  const comments = matches ? items : [];

  // Una consulta nueva por visita; el guard evita reintentos solos tras un fallo.
  const requestedFor = useRef<string | null>(null);
  useEffect(() => {
    if (requestedFor.current === postId) return;
    requestedFor.current = postId;
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const reload = useCallback(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const add = useCallback(
    async (content: string) => {
      const result = await dispatch(addComment({ postId, content }));
      return addComment.fulfilled.match(result);
    },
    [dispatch, postId],
  );

  const update = useCallback(
    async (id: string, content: string) => {
      const result = await dispatch(updateComment({ id, content }));
      return updateComment.fulfilled.match(result);
    },
    [dispatch],
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteComment(id));
      return deleteComment.fulfilled.match(result);
    },
    [dispatch],
  );

  return {
    comments,
    // La API no da total: el contador se deriva de la lista.
    count: comments.length,
    // Una recarga con comentarios ya en pantalla no los vacía.
    isLoading: comments.length === 0 && (!matches || status === "idle" || status === "loading"),
    errorMessage: matches ? storeError : null,
    isAdding,
    addError,
    busyIds,
    itemErrors,
    add,
    update,
    remove,
    reload,
  };
}
