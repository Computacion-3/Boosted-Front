import { DomainError } from "@/src/core/errors/domain-error";
import type { Post, PostViewer } from "../entities/post";
import type { PostRepository } from "../repositories/post.repository";

/** Consultar una publicación por id, respetando la regla de visibilidad de la moderación. */
export class GetPostByIdUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(postId: string, viewer: PostViewer): Promise<Post> {
    const id = postId.trim();
    if (id === "") {
      throw new DomainError("La publicación no tiene id");
    }

    const post = await this.repository.findById(id);
    if (!post.isVisibleTo(viewer)) {
      throw new DomainError("Esta publicación fue ocultada por moderación");
    }

    return post;
  }
}
