import { validateEventFields, type CommunityEvent } from "../entities/community-event";
import type { CreateEventParams, EventRepository } from "../repositories/event.repository";

/** Publicar un evento para convocar a la comunidad. */
export class CreateEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(params: CreateEventParams): Promise<CommunityEvent> {
    const clean: CreateEventParams = {
      name: params.name.trim(),
      description: params.description?.trim() || null,
      city: params.city.trim(),
      date: params.date,
      location: params.location?.trim() || null,
      organizer: params.organizer.trim(),
      type: params.type,
    };
    validateEventFields(clean);
    return this.repository.create(clean);
  }
}
