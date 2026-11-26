"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { PERMISSIONS } from "@/src/core/permissions";
import { requireSession, type Session } from "@/src/lib/dal";
import { commentsContainer } from "../../di/comments.container";
import {
  CommentViewModelMapper,
  type CommentViewModel,
} from "../viewmodels/comment.viewmodel";

/*
 * Server Actions de comentarios: la frontera entre el navegador y el servidor.
 * El thunk las llama; ellas llaman al contenedor (server-only) y devuelven
 * ViewModels planos. Los errores esperados viajan como { ok: false, message }.
 */

// El permiso del token solo decide qué muestra la interfaz; la API sigue
// respondiendo 403 si alguien sin permiso intenta moderar.
function viewerOf(session: Session) {
  return {
    viewerId: session.userId,
    canModerate: session.permissions.includes(PERMISSIONS.POSTS_MODERATE),
  };
}

const COMMENT_WRITE_ERRORS = {
  403: "Solo el autor, un moderador o un administrador puede hacer esto",
  404: "El comentario ya no existe",
};

export async function getCommentsAction(
  postId: string,
): Promise<ActionResult<CommentViewModel[]>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const comments = await commentsContainer.getComments.execute(postId);
    const viewer = viewerOf(session);
    return actionOk(
      comments.map((comment) =>
        CommentViewModelMapper.toViewModel(comment, viewer),
      ),
    );
  } catch (error) {
    return toActionError(error);
  }
}

export async function addCommentAction(
  postId: string,
  content: string,
): Promise<ActionResult<CommentViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const comment = await commentsContainer.addComment.execute(postId, content);
    return actionOk(
      CommentViewModelMapper.toViewModel(comment, viewerOf(session)),
    );
  } catch (error) {
    return toActionError(error, { 404: "La publicación ya no existe" });
  }
}

export async function updateCommentAction(
  id: string,
  content: string,
): Promise<ActionResult<CommentViewModel>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  const session = await requireSession();

  try {
    const comment = await commentsContainer.updateComment.execute(id, content);
    return actionOk(
      CommentViewModelMapper.toViewModel(comment, viewerOf(session)),
    );
  } catch (error) {
    return toActionError(error, COMMENT_WRITE_ERRORS);
  }
}

export async function deleteCommentAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  // Fuera del try/catch: redirect() lanza una excepción y el catch se la tragaría.
  await requireSession();

  try {
    await commentsContainer.deleteComment.execute(id);
    return actionOk({ id });
  } catch (error) {
    return toActionError(error, COMMENT_WRITE_ERRORS);
  }
}
