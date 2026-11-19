import type { CommentBodyDto, CommentDto, DeletedCommentDto } from "../dtos/comment.dto";

/**
 * Contrato de las fuentes de datos de comentarios. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface CommentDatasource {
  getCommentsByPost(postId: string): Promise<CommentDto[]>;
  createComment(postId: string, body: CommentBodyDto): Promise<CommentDto>;
  updateComment(id: string, body: CommentBodyDto): Promise<CommentDto>;
  deleteComment(id: string): Promise<DeletedCommentDto>;
}
