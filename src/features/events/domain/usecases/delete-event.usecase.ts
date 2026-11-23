import { DomainError } from "@/src/core/errors/domain-error";
import type { EventRepository } from "../repositories/event.repository";

/** Eliminar un evento. Mismo permiso que editar (lo verifica el backend). */
export class DeleteEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: string): Promise<void> {
    if (id.trim() === "") {
      throw new DomainError("Falta el id del evento");
    }
    await this.repository.delete(id);
  }
}
