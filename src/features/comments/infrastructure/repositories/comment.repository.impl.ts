import type { Comment } from "../../domain/entities/comment";
import type { CommentRepository } from "../../domain/repositories/comment.repository";
import type { CommentDatasource } from "../datasources/comment-datasource.interface";
import { CommentMapper } from "../mappers/comment.mapper";

/**
 * Implementa el puerto del dominio: habla entidades hacia adentro y DTO hacia afuera.
 * Recibe el datasource por constructor, así no sabe si es REST o GraphQL.
 */
export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly datasource: CommentDatasource) {}

  async findByPost(postId: string): Promise<Comment[]> {
    return CommentMapper.toDomainList(await this.datasource.getCommentsByPost(postId));
  }

  async create(postId: string, content: string): Promise<Comment> {
    return CommentMapper.toDomain(await this.datasource.createComment(postId, CommentMapper.toBody(content)));
  }

  async update(id: string, content: string): Promise<Comment> {
    return CommentMapper.toDomain(await this.datasource.updateComment(id, CommentMapper.toBody(content)));
  }

  async remove(id: string): Promise<void> {
    // La respuesta `{ deleted: true }` no aporta nada al dominio.
    await this.datasource.deleteComment(id);
  }
}
