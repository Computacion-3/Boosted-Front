import type { Paginated } from "@/src/core/domain/paginated";
import type { CommunityEvent } from "../../domain/entities/community-event";
import type {
  CreateEventParams,
  EventQuery,
  EventRepository,
  UpdateEventParams,
} from "../../domain/repositories/event.repository";
import type { EventDatasource } from "../datasources/event-datasource.interface";
import { EventMapper } from "../mappers/event.mapper";

/**
 * Implementa el puerto del dominio: habla entidades hacia adentro y DTO hacia afuera.
 * Recibe el datasource por constructor, así no sabe si es REST o GraphQL.
 */
export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly datasource: EventDatasource) {}

  async findAll(query: EventQuery): Promise<Paginated<CommunityEvent>> {
    const dto = await this.datasource.getEvents(EventMapper.toQueryDto(query));
    return EventMapper.toPaginatedDomain(dto);
  }

  async findById(id: string): Promise<CommunityEvent> {
    const dto = await this.datasource.getEvent(id);
    return EventMapper.toDomain(dto);
  }

  async create(params: CreateEventParams): Promise<CommunityEvent> {
    const dto = await this.datasource.createEvent(EventMapper.toCreateDto(params));
    return EventMapper.toDomain(dto);
  }

  async update(id: string, params: UpdateEventParams): Promise<CommunityEvent> {
    const dto = await this.datasource.updateEvent(id, EventMapper.toUpdateDto(params));
    return EventMapper.toDomain(dto);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.deleteEvent(id);
  }
}
