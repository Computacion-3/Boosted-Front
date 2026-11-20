"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { requirePermission, requireSession, type Session } from "@/src/lib/dal";
import { postsContainer } from "../../di/posts.container";
import type { PostDraft } from "../../domain/entities/post-draft";
import type { PostQuery } from "../../domain/repositories/post.repository";
import {
  PostViewModelMapper,
  type PaginatedPostsViewModel,
  type PostViewModel,
} from "../viewmodels/post.viewmodel";
import type { PostFormValues } from "../viewmodels/post-form.viewmodel";

/*
 * Server Actions de publicaciones: la frontera entre el navegador y el servidor.
 * El thunk las llama; ellas llaman al contenedor (server-only) y devuelven
 * ViewModels planos. Los errores esperados viajan como { ok: false, message }.
 */

// El permiso del token solo decide qué muestra la interfaz; la API sigue
// respondiendo 403 si alguien sin permiso intenta moderar.
function viewerOf(session: Session) {
  return {
    viewerId: session.userId,
    canModerate: session.permissions.includes("posts:moderate"),
  };
}

// Los textos viajan tal cual: el caso de uso los recorta y valida.
function toDraft(values: PostFormValues): PostDraft {
  return {
    title: values.title,
    content: values.content,
    type: values.type,
    vehicleId: values.vehicleId,
    questionDetails: values.questionDetails,
    eventDate: values.eventDate,
    eventCity: values.eventCity,
    eventLocation: values.eventLocation,
  };
}

export async function getPostsAction(
  query: PostQuery,
): Promise<ActionResult<PaginatedPostsViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const result = await postsContainer.getPosts.execute(query);
    return actionOk({
      items: result.items.map((post) =>
        PostViewModelMapper.toViewModel(post, viewerOf(session)),
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
    return actionOk(PostViewModelMapper.toViewModel(post, viewerOf(session)));
  } catch (error) {
    return toActionError(error, {
      404: "La publicación ya no existe. Recarga el feed para ver las actuales.",
    });
  }
}

export async function getPostAction(
  id: string,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();
  const viewer = viewerOf(session);

  try {
    const post = await postsContainer.getPostById.execute(id, {
      userId: session.userId,
      canModerate: viewer.canModerate,
    });
    return actionOk(PostViewModelMapper.toViewModel(post, viewer));
  } catch (error) {
    return toActionError(error, {
      404: "La publicación no existe o fue eliminada",
    });
  }
}

const POST_WRITE_ERRORS = {
  403: "Solo el autor, un moderador o un administrador puede hacer esto",
  404: "La publicación ya no existe",
};

export async function createPostAction(
  values: PostFormValues,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const post = await postsContainer.createPost.execute(toDraft(values));
    return actionOk(PostViewModelMapper.toViewModel(post, viewerOf(session)));
  } catch (error) {
    return toActionError(error, POST_WRITE_ERRORS);
  }
}

export async function updatePostAction(
  id: string,
  values: PostFormValues,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const post = await postsContainer.updatePost.execute(id, toDraft(values));
    return actionOk(PostViewModelMapper.toViewModel(post, viewerOf(session)));
  } catch (error) {
    return toActionError(error, POST_WRITE_ERRORS);
  }
}

export async function deletePostAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  await requireSession();

  try {
    await postsContainer.deletePost.execute(id);
    return actionOk({ id });
  } catch (error) {
    return toActionError(error, POST_WRITE_ERRORS);
  }
}

const MODERATION_ERRORS = {
  403: "No tienes permiso para moderar. Si tu rol cambió, cierra sesión y vuelve a entrar.",
  404: "La publicación ya no existe. Vuelve a la comunidad para ver las actuales.",
};

export async function hidePostAction(
  id: string,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  // El permiso del token solo orienta a la interfaz; aquí se exige de verdad y la API vuelve a decidir.
  const session = await requirePermission("posts:moderate");

  try {
    const post = await postsContainer.hidePost.execute(id);
    return actionOk(PostViewModelMapper.toViewModel(post, viewerOf(session)));
  } catch (error) {
    return toActionError(error, MODERATION_ERRORS);
  }
}

export async function restorePostAction(
  id: string,
): Promise<ActionResult<PostViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requirePermission("posts:moderate");

  try {
    const post = await postsContainer.restorePost.execute(id);
    return actionOk(PostViewModelMapper.toViewModel(post, viewerOf(session)));
  } catch (error) {
    return toActionError(error, MODERATION_ERRORS);
  }
}
