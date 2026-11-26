/**
 * Espejo exacto del JSON de la API para los comentarios (fechas en ISO 8601).
 * Nunca sale de infrastructure: el mapper lo convierte a entidad.
 */
export interface CommentDto {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo de POST /posts/:postId/comments y PATCH /comments/:id. */
export interface CommentBodyDto {
  content: string;
}

/** Respuesta de DELETE /comments/:id. */
export interface DeletedCommentDto {
  deleted: boolean;
}
