import { DomainError } from "@/src/core/errors/domain-error";
import type { CommentRepository } from "../repositories/comment.repository";

/** Eliminar un comentario existente. */
export class DeleteCommentUseCase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(id: string): Promise<void> {
    const commentId = id.trim();
    if (commentId === "") {
      throw new DomainError("El comentario no tiene id");
    }

    await this.repository.remove(commentId);
  }
}
