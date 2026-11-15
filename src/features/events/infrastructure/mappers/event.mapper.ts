import type { Paginated } from "@/src/core/domain/paginated";
import { CommunityEvent, isEventType } from "../../domain/entities/community-event";
import type { EventQuery } from "../../domain/repositories/event.repository";
import type { EventDto, EventQueryDto, PaginatedEventsDto } from "../dtos/event.dto";

/**
 * La «aduana» entre la API y el dominio. Si el backend cambia un nombre de campo,
 * solo cambia este archivo.
 */
export class EventMapper {
  static toDomain(dto: EventDto): CommunityEvent {
    return new CommunityEvent({
      id: dto.id,
      name: dto.name,
      description: dto.description ?? null,
      city: dto.city,
      // Por si la API algún día manda la fecha con hora (2026-10-15T00:00:00.000Z).
      date: dto.date.slice(0, 10),
      location: dto.location ?? null,
      organizer: dto.organizer,
      // Un tipo que el front no conoce no rompe la pantalla: se trata como "otro".
      type: isEventType(dto.type) ? dto.type : "otro",
      createdById: dto.createdById ?? null,
      createdAt: new Date(dto.createdAt),
    });
  }

  static toPaginatedDomain(dto: PaginatedEventsDto): Paginated<CommunityEvent> {
    return {
      items: dto.data.map((event) => EventMapper.toDomain(event)),
      total: dto.total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  static toQueryDto(query: EventQuery): EventQueryDto {
    return {
      page: query.page,
      limit: query.limit,
      city: query.city,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
    };
  }
}
