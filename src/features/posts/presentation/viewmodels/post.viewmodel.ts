import { isVehicleId, POST_TYPES, type Post, type PostType } from "../../domain/entities/post";

/** Publicación lista para pintar: datos planos y serializables (van al estado de Redux). */
export interface PostViewModel {
  readonly id: string;
  readonly title: string;
  /** El contenido recortado para la tarjeta (con «…» si se cortó). */
  readonly excerpt: string;
  readonly type: PostType;
  /** "Avance", "Recomendación"… */
  readonly typeLabel: string;
  readonly authorId: string;
  /** "Tú" si la escribió quien mira; la API no entrega el nombre de los demás autores. */
  readonly authorLabel: string;
  readonly isMine: boolean;
  readonly vehicleId: string | null;
  readonly likeCount: number;
  /** true si quien mira ya dio like a la publicación. */
  readonly likedByMe: boolean;
  /** "17 nov 2026" */
  readonly formattedDate: string;
  /** ISO 8601, para el atributo `dateTime` de la etiqueta <time>. */
  readonly createdAtIso: string;
  /** "1.234 me gusta" (con el separador de miles de es-CO). */
  readonly likesLabel: string;
  /** Solo en publicaciones de tipo evento: "Cali · Autódromo · 18 de octubre de 2026". */
  readonly eventSummary: string | null;
  /** El contenido completo (la tarjeta sigue usando `excerpt`). */
  readonly content: string;
  /** Detalles de la pregunta; null si no aplica. */
  readonly questionDetails: string | null;
  /** Fecha del evento tal como viene (valor crudo, para el formulario de edición). */
  readonly eventDate: string | null;
  /** Ciudad del evento (valor crudo, para el formulario de edición). */
  readonly eventCity: string | null;
  /** Lugar del evento (valor crudo, para el formulario de edición). */
  readonly eventLocation: string | null;
  /** true si la publicación está oculta por moderación. */
  readonly isHidden: boolean;
  /** Quién puede editar o eliminar: el autor o un moderador (la API igual responde 403 si no). */
  readonly canManage: boolean;
  /** true si quien mira puede moderar publicaciones. */
  readonly canModerate: boolean;
}

export interface PaginatedPostsViewModel {
  readonly items: PostViewModel[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  avance: "Avance",
  compra: "Compra",
  pregunta: "Pregunta",
  recomendacion: "Recomendación",
  comparacion: "Comparación",
  evento: "Evento",
  experiencia: "Experiencia",
  general: "General",
};

/** Opciones de los filtros de tipo, en el orden del dominio. */
export const POST_TYPE_OPTIONS = POST_TYPES.map((value) => ({
  value,
  label: POST_TYPE_LABELS[value],
}));

/**
 * Mensaje para el campo «ID del vehículo», o undefined si está vacío o es válido.
 * La regla (que sea un UUID) es del dominio; el texto del aviso es de la pantalla.
 */
export function getVehicleIdError(value: string): string | undefined {
  const id = value.trim();
  return id !== "" && !isVehicleId(id) ? "Debe ser un UUID válido" : undefined;
}

const EXCERPT_MAX_LENGTH = 200;
const OTHER_AUTHOR_LABEL = "Miembro de la comunidad";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  // Siempre la misma zona, ejecute donde ejecute: así el texto no cambia entre servidor y navegador.
  timeZone: "America/Bogota",
});

const longDateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  // La fecha de un evento no tiene hora: se interpreta en UTC para que no se corra un día.
  timeZone: "UTC",
});

const numberFormatter = new Intl.NumberFormat("es-CO");

/** "1.234 me gusta". También la usa el slice para refrescar la etiqueta tras una actualización optimista. */
export function formatLikesLabel(count: number): string {
  return `${numberFormatter.format(count)} me gusta`;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "17 nov 2026": el formateador de es-CO agrega «de» entre las partes, aquí se arma a mano. */
function formatShortDate(date: Date): string {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.day} ${parts.month} ${parts.year}`;
}

/** Recorta el contenido en la última palabra completa que quepa en la tarjeta. */
export function buildExcerpt(content: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_MAX_LENGTH) return text;

  const cut = text.slice(0, EXCERPT_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  // Si no hay un espacio cerca del final, se corta en seco para no dejar la tarjeta casi vacía.
  const base = lastSpace > EXCERPT_MAX_LENGTH * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

/** La fecha de un evento es texto libre: si es AAAA-MM-DD se escribe bonita, si no, se deja igual. */
function formatEventDate(value: string): string {
  if (!DATE_ONLY_PATTERN.test(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  return longDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

function buildEventSummary(post: Post): string | null {
  if (post.type !== "evento") return null;
  const parts = [
    post.eventCity,
    post.eventLocation,
    post.eventDate && formatEventDate(post.eventDate),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export interface PostViewModelContext {
  /** Quién mira (null sin sesión). */
  viewerId: string | null;
  /** true si quien mira tiene el permiso de moderar publicaciones. */
  canModerate: boolean;
}

export class PostViewModelMapper {
  static toViewModel(post: Post, context: PostViewModelContext): PostViewModel {
    const isMine = post.isAuthoredBy(context.viewerId);

    return {
      id: post.id,
      title: post.title,
      excerpt: buildExcerpt(post.content),
      type: post.type,
      typeLabel: POST_TYPE_LABELS[post.type],
      authorId: post.authorId,
      authorLabel: isMine ? "Tú" : OTHER_AUTHOR_LABEL,
      isMine,
      vehicleId: post.vehicleId,
      likeCount: post.likeCount,
      likedByMe: post.isLikedBy(context.viewerId),
      formattedDate: formatShortDate(post.createdAt),
      createdAtIso: post.createdAt.toISOString(),
      likesLabel: formatLikesLabel(post.likeCount),
      eventSummary: buildEventSummary(post),
      content: post.content,
      questionDetails: post.questionDetails,
      eventDate: post.eventDate,
      eventCity: post.eventCity,
      eventLocation: post.eventLocation,
      isHidden: post.hidden,
      canManage: isMine || context.canModerate,
      canModerate: context.canModerate,
    };
  }
}
