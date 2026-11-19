import { DomainError } from "@/src/core/errors/domain-error";

/** Límite de la API para el texto de un comentario (igual que en el backend). */
export const COMMENT_CONTENT_MAX_LENGTH = 1000;

/**
 * Regla única del texto de un comentario: sin espacios en los bordes, no vacío
 * y de máximo `COMMENT_CONTENT_MAX_LENGTH` caracteres. Es la regla que manda;
 * el formulario solo la replica para avisar antes.
 */
export function sanitizeCommentContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed === "") {
    throw new DomainError("El comentario no puede estar vacío");
  }
  if (trimmed.length > COMMENT_CONTENT_MAX_LENGTH) {
    throw new DomainError(`El comentario no puede superar ${COMMENT_CONTENT_MAX_LENGTH} caracteres`);
  }
  return trimmed;
}

export interface CommentProps {
  id: string;
  /** Publicación en la que se escribió el comentario. */
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Un comentario de una publicación. */
export class Comment {
  readonly id: string;
  readonly postId: string;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CommentProps) {
    if (props.id.trim() === "") {
      throw new DomainError("El comentario no tiene id");
    }
    if (props.postId.trim() === "") {
      throw new DomainError("El comentario no tiene publicación");
    }
    if (props.authorId.trim() === "") {
      throw new DomainError("El comentario no tiene autor");
    }

    this.id = props.id;
    this.postId = props.postId;
    this.authorId = props.authorId;
    this.content = sanitizeCommentContent(props.content);
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** true si `userId` es quien lo escribió. Sin sesión (null) nunca es el autor. */
  isAuthoredBy(userId: string | null): boolean {
    return userId !== null && userId === this.authorId;
  }
}
