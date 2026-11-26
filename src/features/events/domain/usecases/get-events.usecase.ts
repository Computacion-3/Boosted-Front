import type { Paginated } from "@/src/core/domain/paginated";
import { DomainError } from "@/src/core/errors/domain-error";
import { isValidEventDate, type CommunityEvent } from "../entities/community-event";
import type { EventQuery, EventRepository } from "../repositories/event.repository";

export const MAX_EVENTS_PER_PAGE = 50;

/** Consultar los eventos de la comunidad con filtros y paginación. */
export class GetEventsUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(query: EventQuery): Promise<Paginated<CommunityEvent>> {
    if (!Number.isInteger(query.page) || query.page < 1) {
      throw new DomainError("La página debe ser un número mayor o igual a 1");
    }
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > MAX_EVENTS_PER_PAGE) {
      throw new DomainError(`Se pueden pedir entre 1 y ${MAX_EVENTS_PER_PAGE} eventos por página`);
    }

    const { startDate, endDate } = query;
    if (startDate && !isValidEventDate(startDate)) {
      throw new DomainError("La fecha inicial no es válida");
    }
    if (endDate && !isValidEventDate(endDate)) {
      throw new DomainError("La fecha final no es válida");
    }
    // Las fechas YYYY-MM-DD se pueden comparar como texto.
    if (startDate && endDate && startDate > endDate) {
      throw new DomainError("La fecha inicial no puede ser posterior a la final");
    }

    return this.repository.findAll({
      ...query,
      city: query.city?.trim() || undefined,
    });
  }
}
