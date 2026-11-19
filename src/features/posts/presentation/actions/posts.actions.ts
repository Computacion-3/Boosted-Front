"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { requireSession } from "@/src/lib/dal";
import { postsContainer } from "../../di/posts.container";
import type { PostQuery } from "../../domain/repositories/post.repository";
import {
  PostViewModelMapper,
  type PaginatedPostsViewModel,
  type PostViewModel,
} from "../viewmodels/post.viewmodel";

/*
 * Server Actions de publicaciones: la frontera entre el navegador y el servidor.
 * El thunk las llama; ellas llaman al contenedor (server-only) y devuelven
 * ViewModels planos. Los errores esperados viajan como { ok: false, message }.
 */

export async function getPostsAction(
  query: PostQuery,
): Promise<ActionResult<PaginatedPostsViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const result = await postsContainer.getPosts.execute(query);
    return actionOk({
      items: result.items.map((post) =>
        PostViewModelMapper.toViewModel(post, { viewerId: session.userId }),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function togglePostLikeAction(
  postId: string,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const post = await postsContainer.togglePostLike.execute(postId);
    return actionOk(
      PostViewModelMapper.toViewModel(post, { viewerId: session.userId }),
    );
  } catch (error) {
    return toActionError(error, {
      404: "La publicación ya no existe. Recarga el feed para ver las actuales.",
    });
  }
}
