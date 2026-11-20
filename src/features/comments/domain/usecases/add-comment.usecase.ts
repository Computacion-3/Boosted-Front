import { DomainError } from "@/src/core/errors/domain-error";
import type { Comment } from "../entities/comment";
import { sanitizeCommentContent } from "../entities/comment";
import type { CommentRepository } from "../repositories/comment.repository";

/** Agregar un comentario a una publicación con el contenido ya validado. */
export class AddCommentUseCase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(postId: string, content: string): Promise<Comment> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    return this.repository.create(id, sanitizeCommentContent(content));
  }
}
