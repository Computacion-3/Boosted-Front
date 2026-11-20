import "server-only";
import { AddCommentUseCase } from "../domain/usecases/add-comment.usecase";
import { DeleteCommentUseCase } from "../domain/usecases/delete-comment.usecase";
import { GetCommentsUseCase } from "../domain/usecases/get-comments.usecase";
import { UpdateCommentUseCase } from "../domain/usecases/update-comment.usecase";
import type { CommentDatasource } from "../infrastructure/datasources/comment-datasource.interface";
import { CommentRestDatasource } from "../infrastructure/datasources/comment-rest-datasource";
import { CommentRepositoryImpl } from "../infrastructure/repositories/comment.repository.impl";

/**
 * Raíz de composición de comentarios: el único archivo que conoce las clases concretas.
 * NEXT_PUBLIC_DATA_SOURCE elige la fuente de datos y nada más cambia (ni casos de uso,
 * ni entidades, ni slice, ni componentes).
 */
function createCommentDatasource(): CommentDatasource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "rest";

  switch (source) {
    case "rest":
      return new CommentRestDatasource();
    // Cuando el backend exponga comentarios por GraphQL: crear
    // `infrastructure/datasources/comment-graphql-datasource.ts` (implementa CommentDatasource y
    // devuelve los mismos DTO) y agregar aquí `case "graphql": return new CommentGraphQLDatasource();`.
    default:
      throw new Error(
        `NEXT_PUBLIC_DATA_SOURCE="${source}" todavía no está soportado en comentarios. Usa "rest".`,
      );
  }
}

const repository = new CommentRepositoryImpl(createCommentDatasource());

export const commentsContainer = {
  getComments: new GetCommentsUseCase(repository),
  addComment: new AddCommentUseCase(repository),
  updateComment: new UpdateCommentUseCase(repository),
  deleteComment: new DeleteCommentUseCase(repository),
};

export type CommentsContainer = typeof commentsContainer;
