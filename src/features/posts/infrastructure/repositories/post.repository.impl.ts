import type { Paginated } from "@/src/core/domain/paginated";
import type { Post } from "../../domain/entities/post";
import type { PostDraft } from "../../domain/entities/post-draft";
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

  async findById(id: string): Promise<Post> {
    return PostMapper.toDomain(await this.datasource.getPostById(id));
  }

  async create(draft: PostDraft): Promise<Post> {
    return PostMapper.toDomain(await this.datasource.createPost(PostMapper.toCreateBody(draft)));
  }

  async update(id: string, draft: PostDraft): Promise<Post> {
    return PostMapper.toDomain(await this.datasource.updatePost(id, PostMapper.toUpdateBody(draft)));
  }

  async setHidden(id: string, hidden: boolean): Promise<Post> {
    return PostMapper.toDomain(await this.datasource.setPostHidden(id, { hidden }));
  }

  async remove(id: string): Promise<void> {
    // La respuesta `{ deleted: true }` no aporta nada al dominio.
    await this.datasource.deletePost(id);
  }
}
