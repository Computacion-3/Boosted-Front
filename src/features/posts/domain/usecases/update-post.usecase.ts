import { DomainError } from "@/src/core/errors/domain-error";
import type { Post } from "../entities/post";
import { sanitizePostDraft, type PostDraft } from "../entities/post-draft";
import type { PostRepository } from "../repositories/post.repository";

/** Editar una publicación existente con un borrador validado. */
export class UpdatePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string, draft: PostDraft): Promise<Post> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    return this.repository.update(id, sanitizePostDraft(draft));
  }
}
