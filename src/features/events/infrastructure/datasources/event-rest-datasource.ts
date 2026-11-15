import { apiClient } from "@/src/core/http/api-client";
import type { EventDto, EventQueryDto, PaginatedEventsDto } from "../dtos/event.dto";
import type { EventDatasource } from "./event-datasource.interface";

/** Eventos por REST. La lectura de eventos es pública en la API, por eso `auth: "none"`. */
export class EventRestDatasource implements EventDatasource {
  getEvents(query: EventQueryDto): Promise<PaginatedEventsDto> {
    return apiClient.get<PaginatedEventsDto>("/events", { auth: "none", query: { ...query } });
  }

  getEvent(id: string): Promise<EventDto> {
    return apiClient.get<EventDto>(`/events/${encodeURIComponent(id)}`, { auth: "none" });
  }
}
