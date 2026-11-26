import { DomainError } from "@/src/core/errors/domain-error";
import type { CommunityEvent } from "../entities/community-event";
import type { EventRepository } from "../repositories/event.repository";

/** Ver el detalle de un evento. */
export class GetEventByIdUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: string): Promise<CommunityEvent> {
    if (id.trim() === "") {
      throw new DomainError("Falta el id del evento");
    }
    return this.repository.findById(id);
  }
}
