"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { createPost, deletePost, updatePost } from "../store/posts.slice";
import type { PostFormValues } from "../viewmodels/post-form.viewmodel";
import type { PostViewModel } from "../viewmodels/post.viewmodel";

/**
 * Hook fachada de las mutaciones de publicaciones (crear, editar, eliminar).
 * Cada función devuelve el resultado para que la pantalla decida si navegar.
 */
export function usePostEditor(): {
  isSubmitting: boolean;
  errorMessage: string | null;
  create: (values: PostFormValues) => Promise<PostViewModel | null>;
  update: (id: string, values: PostFormValues) => Promise<PostViewModel | null>;
  remove: (id: string) => Promise<boolean>;
} {
  const dispatch = useAppDispatch();
  const mutation = useAppSelector((state) => state.posts.mutation);

  const create = useCallback(
    async (values: PostFormValues) => {
      const result = await dispatch(createPost(values));
      return createPost.fulfilled.match(result) ? result.payload : null;
    },
    [dispatch],
  );

  const update = useCallback(
    async (id: string, values: PostFormValues) => {
      const result = await dispatch(updatePost({ id, values }));
      return updatePost.fulfilled.match(result) ? result.payload : null;
    },
    [dispatch],
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await dispatch(deletePost(id));
      return deletePost.fulfilled.match(result);
    },
    [dispatch],
  );

  return {
    isSubmitting: mutation.status === "submitting",
    errorMessage: mutation.errorMessage,
    create,
    update,
    remove,
  };
}
