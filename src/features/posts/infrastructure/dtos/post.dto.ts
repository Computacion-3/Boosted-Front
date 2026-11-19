// Espejo exacto del JSON de la API de publicaciones (backend Boosted, módulo posts).
// Estos tipos no salen de infraestructura: el mapper los convierte en entidades.

export interface PostDto {
  id: string;
  /** Hasta 120 caracteres. */
  title: string;
  /** Hasta 5000 caracteres. */
  content: string;
  /** avance | compra | pregunta | recomendacion | comparacion | evento | experiencia | general */
  type: string;
  authorId: string;
  vehicleId: string | null;
  likeCount: number;
  /** El backend lo declara opcional. */
  likedBy?: string[];
  hidden: boolean;
  questionDetails: string | null;
  eventDate: string | null;
  eventCity: string | null;
  eventLocation: string | null;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** Respuesta de GET /posts. */
export interface PaginatedPostsDto {
  data: PostDto[];
  total: number;
  page: number;
  limit: number;
}

/** Parámetros de GET /posts. `type` admite varios valores. */
export interface PostQueryDto {
  page: number;
  limit: number;
  type?: string[];
  authorId?: string;
  vehicleId?: string;
  search?: string;
}
