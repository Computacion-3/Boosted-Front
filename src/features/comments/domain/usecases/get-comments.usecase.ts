import { DomainError } from "@/src/core/errors/domain-error";
import type { Comment } from "../entities/comment";
import type { CommentRepository } from "../repositories/comment.repository";

/** Obtener los comentarios de una publicación, del más antiguo al más reciente. */
export class GetCommentsUseCase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(postId: string): Promise<Comment[]> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    const comments = await this.repository.findByPost(id);
    return [...comments].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
