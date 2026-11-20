import { DomainError } from "@/src/core/errors/domain-error";
import type { Comment } from "../entities/comment";
import { sanitizeCommentContent } from "../entities/comment";
import type { CommentRepository } from "../repositories/comment.repository";

/** Editar el contenido de un comentario existente. */
export class UpdateCommentUseCase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(id: string, content: string): Promise<Comment> {
    const commentId = id.trim();
    if (commentId === "") {
      throw new DomainError("El comentario no tiene id");
    }

    return this.repository.update(commentId, sanitizeCommentContent(content));
  }
}
