import { DomainError } from "@/src/core/errors/domain-error";
import type { Post } from "../entities/post";
import type { PostRepository } from "../repositories/post.repository";

/** Moderación: volver a mostrar en el feed una publicación que estaba oculta. */
export class RestorePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string): Promise<Post> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    return this.repository.setHidden(id, false);
  }
}
