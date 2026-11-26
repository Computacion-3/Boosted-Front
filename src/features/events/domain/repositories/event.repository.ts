import type { Paginated } from "@/src/core/domain/paginated";
import type { CommunityEvent, EventFields, EventType } from "../entities/community-event";

/** Filtros del listado. Los campos vacíos no filtran. */
export interface EventFilters {
  city?: string;
  type?: EventType;
  /** YYYY-MM-DD, inclusive. */
  startDate?: string;
  /** YYYY-MM-DD, inclusive. */
  endDate?: string;
}

export interface EventQuery extends EventFilters {
  /** Desde 1. */
  page: number;
  /** De 1 a 50. */
  limit: number;
}

/** Datos para crear un evento. El creador no va aquí: el backend lo toma del token. */
export type CreateEventParams = EventFields;

/** Datos para editar: solo los campos que cambian. */
export type UpdateEventParams = Partial<EventFields>;

/**
 * Puerto del módulo de eventos: lo que el dominio necesita, sin decir cómo se obtiene.
 * Es el único puerto del módulo dual: lo implementa un repositorio que puede usar
 * el datasource REST o el GraphQL sin que el dominio se entere.
 */
export interface EventRepository {
  findAll(query: EventQuery): Promise<Paginated<CommunityEvent>>;
  findById(id: string): Promise<CommunityEvent>;
  create(params: CreateEventParams): Promise<CommunityEvent>;
  update(id: string, params: UpdateEventParams): Promise<CommunityEvent>;
  delete(id: string): Promise<void>;
}
