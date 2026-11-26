import "server-only";
import { CreatePostUseCase } from "../domain/usecases/create-post.usecase";
import { DeletePostUseCase } from "../domain/usecases/delete-post.usecase";
import { GetPostByIdUseCase } from "../domain/usecases/get-post-by-id.usecase";
import { GetPostsUseCase } from "../domain/usecases/get-posts.usecase";
import { HidePostUseCase } from "../domain/usecases/hide-post.usecase";
import { RestorePostUseCase } from "../domain/usecases/restore-post.usecase";
import { TogglePostLikeUseCase } from "../domain/usecases/toggle-post-like.usecase";
import { UpdatePostUseCase } from "../domain/usecases/update-post.usecase";
import { PostRestDatasource } from "../infrastructure/datasources/post-rest-datasource";
import { PostRepositoryImpl } from "../infrastructure/repositories/post.repository.impl";

/**
 * Raíz de composición de publicaciones: el único archivo que conoce las clases concretas.
 * Publicaciones solo habla REST. NEXT_PUBLIC_DATA_SOURCE cambia únicamente el módulo dual
 * (eventos), así que aquí se ignora: con `graphql` el resto de la app sigue funcionando.
 * Si algún día publicaciones tiene GraphQL, se agrega aquí el mismo `switch` de eventos.
 */
const repository = new PostRepositoryImpl(new PostRestDatasource());

export const postsContainer = {
  getPosts: new GetPostsUseCase(repository),
  togglePostLike: new TogglePostLikeUseCase(repository),
  getPostById: new GetPostByIdUseCase(repository),
  createPost: new CreatePostUseCase(repository),
  updatePost: new UpdatePostUseCase(repository),
  deletePost: new DeletePostUseCase(repository),
  hidePost: new HidePostUseCase(repository),
  restorePost: new RestorePostUseCase(repository),
};

export type PostsContainer = typeof postsContainer;
