import { apiClient } from "@/src/core/http/api-client";
import type { CommentBodyDto, CommentDto, DeletedCommentDto } from "../dtos/comment.dto";
import type { CommentDatasource } from "./comment-datasource.interface";

/**
 * Comentarios por REST. Leerlos es público en la API, por eso `auth: "none"`;
 * escribir (crear, editar, borrar) exige sesión (`auth: "required"`, el valor por defecto).
 */
export class CommentRestDatasource implements CommentDatasource {
  getCommentsByPost(postId: string): Promise<CommentDto[]> {
    return apiClient.get<CommentDto[]>(`/posts/${encodeURIComponent(postId)}/comments`, { auth: "none" });
  }

  createComment(postId: string, body: CommentBodyDto): Promise<CommentDto> {
    return apiClient.post<CommentDto>(`/posts/${encodeURIComponent(postId)}/comments`, body);
  }

  updateComment(id: string, body: CommentBodyDto): Promise<CommentDto> {
    return apiClient.patch<CommentDto>(`/comments/${encodeURIComponent(id)}`, body);
  }

  deleteComment(id: string): Promise<DeletedCommentDto> {
    return apiClient.delete<DeletedCommentDto>(`/comments/${encodeURIComponent(id)}`);
  }
}
