import type { EventDto, EventQueryDto, PaginatedEventsDto } from "../dtos/event.dto";

/**
 * Contrato de las fuentes de datos de eventos. REST y GraphQL lo implementan
 * y devuelven los MISMOS DTO, así el mapper y el repositorio no cambian.
 */
export interface EventDatasource {
  getEvents(query: EventQueryDto): Promise<PaginatedEventsDto>;
  getEvent(id: string): Promise<EventDto>;
}
