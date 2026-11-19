import { Comment } from "../../domain/entities/comment";
import type { CommentBodyDto, CommentDto } from "../dtos/comment.dto";

/**
 * La «aduana» entre la API y el dominio. Si el backend cambia un nombre de campo,
 * solo cambia este archivo.
 */
export class CommentMapper {
  static toDomain(dto: CommentDto): Comment {
    return new Comment({
      id: dto.id,
      postId: dto.postId,
      authorId: dto.authorId,
      content: dto.content,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  static toDomainList(dtos: CommentDto[]): Comment[] {
    return dtos.map((dto) => CommentMapper.toDomain(dto));
  }

  /** Cuerpo de POST y PATCH: el `authorId` nunca viaja, la API lo toma de la sesión. */
  static toBody(content: string): CommentBodyDto {
    return { content };
  }
}
