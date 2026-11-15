import { DomainError } from "@/src/core/errors/domain-error";
import { validateEventFields, type CommunityEvent } from "../entities/community-event";
import type { EventRepository, UpdateEventParams } from "../repositories/event.repository";

/** Editar un evento. Solo lo puede hacer quien lo creó, un moderador o un administrador (lo verifica el backend). */
export class UpdateEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: string, params: UpdateEventParams): Promise<CommunityEvent> {
    if (id.trim() === "") {
      throw new DomainError("Falta el id del evento");
    }

    // Solo se limpian los campos que vienen; los opcionales vacíos quedan en null (se borran).
    const clean: UpdateEventParams = { ...params };
    if (params.name !== undefined) clean.name = params.name.trim();
    if (params.city !== undefined) clean.city = params.city.trim();
    if (params.organizer !== undefined) clean.organizer = params.organizer.trim();
    if (params.description !== undefined) clean.description = params.description?.trim() || null;
    if (params.location !== undefined) clean.location = params.location?.trim() || null;

    if (Object.keys(clean).length === 0) {
      throw new DomainError("No hay cambios para guardar");
    }
    validateEventFields(clean);
    return this.repository.update(id, clean);
  }
}
