import type { Post } from "../entities/post";
import { sanitizePostDraft, type PostDraft } from "../entities/post-draft";
import type { PostRepository } from "../repositories/post.repository";

/** Crear una publicación nueva a partir de un borrador validado. */
export class CreatePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(draft: PostDraft): Promise<Post> {
    return this.repository.create(sanitizePostDraft(draft));
  }
}
