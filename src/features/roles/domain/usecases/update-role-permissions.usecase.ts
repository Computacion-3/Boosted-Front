import { DomainError } from "@/src/core/errors/domain-error";
import {
  ADMIN_ROLE,
  ROLES_UPDATE_PERMISSION,
  type RolePermissions,
} from "../entities/role-permissions";
import type { RoleRepository } from "../repositories/role.repository";

/**
 * Editar los permisos de un rol (reemplaza la lista completa).
 *
 * Regla de negocio: el administrador no puede perder `roles:update`, porque
 * nadie podría volver a editar los roles. El backend también lo rechaza (400);
 * aquí se revisa antes para dar el mensaje sin ir a la red.
 */
export class UpdateRolePermissionsUseCase {
  constructor(private readonly repository: RoleRepository) {}

  async execute(role: string, permissions: string[]): Promise<RolePermissions> {
    if (role.trim() === "") {
      throw new DomainError("Falta el rol");
    }

    const unique = [...new Set(permissions.map((permission) => permission.trim()))].filter(
      (permission) => permission !== "",
    );

    if (role === ADMIN_ROLE && !unique.includes(ROLES_UPDATE_PERMISSION)) {
      throw new DomainError(
        `El rol administrador no puede perder el permiso ${ROLES_UPDATE_PERMISSION}`,
      );
    }

    return this.repository.updatePermissions(role, unique);
  }
}
