import "server-only";
import { AddCommentUseCase } from "../domain/usecases/add-comment.usecase";
import { DeleteCommentUseCase } from "../domain/usecases/delete-comment.usecase";
import { GetCommentsUseCase } from "../domain/usecases/get-comments.usecase";
import { UpdateCommentUseCase } from "../domain/usecases/update-comment.usecase";
import { CommentRestDatasource } from "../infrastructure/datasources/comment-rest-datasource";
import { CommentRepositoryImpl } from "../infrastructure/repositories/comment.repository.impl";

/**
 * Raíz de composición de comentarios: el único archivo que conoce las clases concretas.
 * Comentarios solo habla REST. NEXT_PUBLIC_DATA_SOURCE cambia únicamente el módulo dual
 * (eventos), así que aquí se ignora: con `graphql` el resto de la app sigue funcionando.
 */
const repository = new CommentRepositoryImpl(new CommentRestDatasource());

export const commentsContainer = {
  getComments: new GetCommentsUseCase(repository),
  addComment: new AddCommentUseCase(repository),
  updateComment: new UpdateCommentUseCase(repository),
  deleteComment: new DeleteCommentUseCase(repository),
};

export type CommentsContainer = typeof commentsContainer;
