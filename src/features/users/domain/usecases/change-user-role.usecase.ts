import { DomainError } from "@/src/core/errors/domain-error";
import { isUserRole, type ManagedUser } from "../entities/managed-user";
import type { UserRepository } from "../repositories/user.repository";

/**
 * Cambiar el rol de una cuenta. Que nadie pueda cambiarse su propio rol lo
 * decide el backend (responde 400): la interfaz además deshabilita ese control.
 */
export class ChangeUserRoleUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: string, role: string): Promise<ManagedUser> {
    if (id.trim() === "") {
      throw new DomainError("Falta el id del usuario");
    }
    if (!isUserRole(role)) {
      throw new DomainError("El rol elegido no es válido");
    }
    return this.repository.updateRole(id, role);
  }
}
