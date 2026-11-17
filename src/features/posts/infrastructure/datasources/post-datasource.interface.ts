import type { PaginatedPostsDto, PostQueryDto } from "../dtos/post.dto";

/**
 * Contrato de las fuentes de datos de publicaciones. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto>;
}
