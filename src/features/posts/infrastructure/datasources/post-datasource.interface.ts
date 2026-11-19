import type { PaginatedPostsDto, PostDto, PostQueryDto } from "../dtos/post.dto";

/**
 * Contrato de las fuentes de datos de publicaciones. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto>;
  /** La API alterna el like del usuario en la sesión y devuelve la publicación ya actualizada. */
  toggleLike(id: string): Promise<PostDto>;
}
