import type {
  DeletedDto,
  PaginatedPostsDto,
  PostBodyDto,
  PostDto,
  PostHiddenBodyDto,
  PostQueryDto,
} from "../dtos/post.dto";

/**
 * Contrato de las fuentes de datos de publicaciones. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto>;
  getPostById(id: string): Promise<PostDto>;
  createPost(body: PostBodyDto): Promise<PostDto>;
  updatePost(id: string, body: PostBodyDto): Promise<PostDto>;
  deletePost(id: string): Promise<DeletedDto>;
  /** La API alterna el like del usuario en la sesión y devuelve la publicación ya actualizada. */
  toggleLike(id: string): Promise<PostDto>;
  /** Moderación: oculta o vuelve a mostrar la publicación y devuelve la publicación ya actualizada. */
  setPostHidden(id: string, body: PostHiddenBodyDto): Promise<PostDto>;
}
