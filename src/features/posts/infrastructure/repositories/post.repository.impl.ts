import type { Paginated } from "@/src/core/domain/paginated";
import type { Post } from "../../domain/entities/post";
import type { PostQuery, PostRepository } from "../../domain/repositories/post.repository";
import type { PostDatasource } from "../datasources/post-datasource.interface";
import { PostMapper } from "../mappers/post.mapper";

/**
 * Implementa el puerto del dominio: habla entidades hacia adentro y DTO hacia afuera.
 * Recibe el datasource por constructor, así no sabe si es REST o GraphQL.
 */
export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly datasource: PostDatasource) {}

  async findAll(query: PostQuery): Promise<Paginated<Post>> {
    const dto = await this.datasource.getPosts(PostMapper.toQueryDto(query));
    return PostMapper.toPaginatedDomain(dto);
  }

  async toggleLike(id: string): Promise<Post> {
    return PostMapper.toDomain(await this.datasource.toggleLike(id));
  }
}
