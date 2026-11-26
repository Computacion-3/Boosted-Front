import { DomainError } from "@/src/core/errors/domain-error";
import { isUserStatus, type ManagedUser } from "../entities/managed-user";
import type { UserRepository } from "../repositories/user.repository";

/**
 * Activar o desactivar una cuenta. Una cuenta inactiva no puede iniciar sesión
 * y el cambio tiene efecto inmediato en el backend.
 */
export class ChangeUserStatusUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, status: string): Promise<ManagedUser> {
    if (id.trim() === "") {
      throw new DomainError("Falta el id del usuario");
    }
    if (!isUserStatus(status)) {
      throw new DomainError("El estado elegido no es válido");
    }
    return this.repository.updateStatus(id, status);
  }
}
