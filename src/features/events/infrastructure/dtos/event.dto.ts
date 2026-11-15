// Espejo exacto del JSON de la API de eventos (backend Boosted, módulo events).
// Estos tipos no salen de infraestructura: el mapper los convierte en entidades.

export interface EventDto {
  id: string;
  name: string;
  description: string | null;
  city: string;
  /** YYYY-MM-DD */
  date: string;
  location: string | null;
  organizer: string;
  /** meet | exposicion | reunion_club | jornada_mantenimiento | circuito | otro */
  type: string;
  createdById: string | null;
  /** ISO 8601 */
  createdAt: string;
}

/** Respuesta de GET /events. */
export interface PaginatedEventsDto {
  data: EventDto[];
  total: number;
  page: number;
  limit: number;
}

/** Query string de GET /events. */
export interface EventQueryDto {
  page: number;
  limit: number;
  city?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

/** Body de POST /events. El creador no se manda: el backend lo toma del token. */
export interface CreateEventDto {
  name: string;
  description?: string;
  city: string;
  date: string;
  location?: string;
  organizer: string;
  type: string;
}

/** Body de PATCH /events/:id. `null` borra un campo opcional. */
export interface UpdateEventDto {
  name?: string;
  description?: string | null;
  city?: string;
  date?: string;
  location?: string | null;
  organizer?: string;
  type?: string;
}
