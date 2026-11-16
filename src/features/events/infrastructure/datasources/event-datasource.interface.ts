import type {
  CreateEventDto,
  EventDto,
  EventQueryDto,
  PaginatedEventsDto,
  UpdateEventDto,
} from "../dtos/event.dto";

/**
 * Contrato de las fuentes de datos de eventos. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface EventDatasource {
  getEvents(query: EventQueryDto): Promise<PaginatedEventsDto>;
  getEvent(id: string): Promise<EventDto>;
  createEvent(dto: CreateEventDto): Promise<EventDto>;
  updateEvent(id: string, dto: UpdateEventDto): Promise<EventDto>;
  deleteEvent(id: string): Promise<void>;
}
