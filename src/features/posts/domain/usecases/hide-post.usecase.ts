import { DomainError } from "@/src/core/errors/domain-error";
import type { Post } from "../entities/post";
import type { PostRepository } from "../repositories/post.repository";

/** Moderación: ocultar una publicación del feed. Sigue existiendo y se puede restaurar. */
export class HidePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string): Promise<Post> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    return this.repository.setHidden(id, true);
  }
}
