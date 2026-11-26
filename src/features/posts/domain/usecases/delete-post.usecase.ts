import { DomainError } from "@/src/core/errors/domain-error";
import type { PostRepository } from "../repositories/post.repository";

/** Eliminar una publicación. */
export class DeletePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string): Promise<void> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    await this.repository.remove(id);
  }
}
