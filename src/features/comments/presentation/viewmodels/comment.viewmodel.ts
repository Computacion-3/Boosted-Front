import { COMMENT_CONTENT_MAX_LENGTH, type Comment } from "../../domain/entities/comment";

// El límite se reexporta para que los componentes no importen el dominio.
export { COMMENT_CONTENT_MAX_LENGTH };

/** Comentario listo para pintar: datos planos y serializables (van al estado de Redux). */
export interface CommentViewModel {
  readonly id: string;
  readonly content: string;
  /** "Tú" si lo escribió quien mira; la API no entrega el nombre de los demás autores. */
  readonly authorLabel: string;
  readonly isMine: boolean;
  /** Quién puede editar o eliminar: el autor o un moderador (la API igual responde 403 si no). */
  readonly canManage: boolean;
  /** "19 nov 2026, 3:45 p. m." (zona America/Bogota). */
  readonly formattedDate: string;
  /** ISO 8601, para el atributo `dateTime` de la etiqueta <time>. */
  readonly createdAtIso: string;
  /** true si se editó después de publicarse (más de 1 segundo de diferencia). */
  readonly isEdited: boolean;
}

export interface CommentViewModelContext {
  /** Quién mira (null sin sesión). */
  viewerId: string | null;
  /** true si quien mira tiene el permiso de moderar publicaciones. */
  canModerate: boolean;
}

/**
 * Aviso para el formulario del comentario, o undefined si el texto es válido.
 * Replica la regla para avisar antes de enviar; la que manda es
 * `sanitizeCommentContent` en el dominio.
 */
export function validateCommentContent(content: string): string | undefined {
  const text = content.trim();
  if (text === "") return "Escribe un comentario";
  if (text.length > COMMENT_CONTENT_MAX_LENGTH) {
    return `El comentario no puede superar ${COMMENT_CONTENT_MAX_LENGTH} caracteres`;
  }
  return undefined;
}

const OTHER_AUTHOR_LABEL = "Miembro de la comunidad";
const EDITED_THRESHOLD_MS = 1000;

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  // Siempre la misma zona, ejecute donde ejecute: así el texto no cambia entre servidor y navegador.
  timeZone: "America/Bogota",
});

/** "19 nov 2026, 3:45 p. m.": el formateador de es-CO agrega «de» entre las partes, aquí se arma a mano. */
function formatDateTime(date: Date): string {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  const period = String(parts.dayPeriod ?? "").toLowerCase().replace(/\./g, "").replace(/\s/g, "");
  const meridiem = period.startsWith("p") ? "p. m." : "a. m.";
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${meridiem}`;
}

export class CommentViewModelMapper {
  static toViewModel(comment: Comment, context: CommentViewModelContext): CommentViewModel {
    const isMine = comment.isAuthoredBy(context.viewerId);

    return {
      id: comment.id,
      content: comment.content,
      authorLabel: isMine ? "Tú" : OTHER_AUTHOR_LABEL,
      isMine,
      canManage: isMine || context.canModerate,
      formattedDate: formatDateTime(comment.createdAt),
      createdAtIso: comment.createdAt.toISOString(),
      isEdited: comment.updatedAt.getTime() - comment.createdAt.getTime() > EDITED_THRESHOLD_MS,
    };
  }
}
