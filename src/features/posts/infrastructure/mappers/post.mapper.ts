import type { Paginated } from "@/src/core/domain/paginated";
import { isPostType, Post } from "../../domain/entities/post";
import type { PostQuery } from "../../domain/repositories/post.repository";
import type { PaginatedPostsDto, PostDto, PostQueryDto } from "../dtos/post.dto";

/**
 * La «aduana» entre la API y el dominio. Si el backend cambia un nombre de campo,
 * solo cambia este archivo.
 */
export class PostMapper {
  static toDomain(dto: PostDto): Post {
    return new Post({
      id: dto.id,
      title: dto.title,
      content: dto.content,
      // Un tipo que el front no conoce no rompe la pantalla: se trata como "general".
      type: isPostType(dto.type) ? dto.type : "general",
      authorId: dto.authorId,
      vehicleId: dto.vehicleId ?? null,
      likeCount: dto.likeCount,
      likedBy: dto.likedBy ?? [],
      hidden: dto.hidden,
      questionDetails: dto.questionDetails ?? null,
      eventDate: dto.eventDate ?? null,
      eventCity: dto.eventCity ?? null,
      eventLocation: dto.eventLocation ?? null,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toPaginatedDomain(dto: PaginatedPostsDto): Paginated<Post> {
    return {
      items: dto.data.map((post) => PostMapper.toDomain(post)),
      total: dto.total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  static toQueryDto(query: PostQuery): PostQueryDto {
    return {
      page: query.page,
      limit: query.limit,
      type: query.types,
      authorId: query.authorId,
      vehicleId: query.vehicleId,
      search: query.search,
    };
  }
}
