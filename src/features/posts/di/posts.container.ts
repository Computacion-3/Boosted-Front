import "server-only";
import { CreatePostUseCase } from "../domain/usecases/create-post.usecase";
import { DeletePostUseCase } from "../domain/usecases/delete-post.usecase";
import { GetPostByIdUseCase } from "../domain/usecases/get-post-by-id.usecase";
import { GetPostsUseCase } from "../domain/usecases/get-posts.usecase";
import { TogglePostLikeUseCase } from "../domain/usecases/toggle-post-like.usecase";
import { UpdatePostUseCase } from "../domain/usecases/update-post.usecase";
import type { PostDatasource } from "../infrastructure/datasources/post-datasource.interface";
import { PostRestDatasource } from "../infrastructure/datasources/post-rest-datasource";
import { PostRepositoryImpl } from "../infrastructure/repositories/post.repository.impl";

/**
 * Raíz de composición de publicaciones: el único archivo que conoce las clases concretas.
 * NEXT_PUBLIC_DATA_SOURCE elige la fuente de datos y nada más cambia (ni casos de uso,
 * ni entidades, ni slice, ni componentes).
 */
function createPostDatasource(): PostDatasource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "rest";

  switch (source) {
    case "rest":
      return new PostRestDatasource();
    // Cuando el backend exponga publicaciones por GraphQL: crear
    // `infrastructure/datasources/post-graphql-datasource.ts` (implementa PostDatasource y
    // devuelve los mismos DTO) y agregar aquí `case "graphql": return new PostGraphQLDatasource();`.
    default:
      throw new Error(
        `NEXT_PUBLIC_DATA_SOURCE="${source}" todavía no está soportado en publicaciones. Usa "rest".`,
      );
  }
}

const repository = new PostRepositoryImpl(createPostDatasource());

export const postsContainer = {
  getPosts: new GetPostsUseCase(repository),
  togglePostLike: new TogglePostLikeUseCase(repository),
  getPostById: new GetPostByIdUseCase(repository),
  createPost: new CreatePostUseCase(repository),
  updatePost: new UpdatePostUseCase(repository),
  deletePost: new DeletePostUseCase(repository),
};

export type PostsContainer = typeof postsContainer;
