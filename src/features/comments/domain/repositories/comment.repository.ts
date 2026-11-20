import type { Comment } from "../entities/comment";

/**
 * Puerto del módulo de comentarios: lo que el dominio necesita, sin decir cómo se obtiene.
 * El texto (`content`) llega ya limpio y validado por el caso de uso.
 */
export interface CommentRepository {
  /** Comentarios de la publicación, en orden cronológico como los entrega la API. */
  findByPost(postId: string): Promise<Comment[]>;
  /** Crea un comentario en la publicación; el texto llega ya sanitizado. */
  create(postId: string, content: string): Promise<Comment>;
  /** Reemplaza el texto del comentario; llega ya sanitizado. */
  update(id: string, content: string): Promise<Comment>;
  /** Elimina el comentario. */
  remove(id: string): Promise<void>;
}
