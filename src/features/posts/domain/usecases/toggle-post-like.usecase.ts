import { DomainError } from "@/src/core/errors/domain-error";
import type { Post } from "../entities/post";
import type { PostRepository } from "../repositories/post.repository";

/** Dar o quitar el like de la persona con sesión a una publicación. */
export class TogglePostLikeUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string): Promise<Post> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    return this.repository.toggleLike(id);
  }
}
