import { apiClient } from "@/src/core/http/api-client";
import type {
  CreateEventDto,
  EventDto,
  EventQueryDto,
  PaginatedEventsDto,
  UpdateEventDto,
} from "../dtos/event.dto";
import type { EventDatasource } from "./event-datasource.interface";

/**
 * Eventos por REST. Leer es público en la API (`auth: "none"`); crear, editar y
 * eliminar exigen sesión (`auth: "required"`, el valor por defecto del cliente).
 */
export class EventRestDatasource implements EventDatasource {
  getEvents(query: EventQueryDto): Promise<PaginatedEventsDto> {
    return apiClient.get<PaginatedEventsDto>("/events", { auth: "none", query: { ...query } });
  }

  getEvent(id: string): Promise<EventDto> {
    return apiClient.get<EventDto>(`/events/${encodeURIComponent(id)}`, { auth: "none" });
  }

  createEvent(dto: CreateEventDto): Promise<EventDto> {
    return apiClient.post<EventDto>("/events", dto);
  }

  updateEvent(id: string, dto: UpdateEventDto): Promise<EventDto> {
    return apiClient.patch<EventDto>(`/events/${encodeURIComponent(id)}`, dto);
  }

  deleteEvent(id: string): Promise<void> {
    return apiClient.delete<void>(`/events/${encodeURIComponent(id)}`);
  }
}
