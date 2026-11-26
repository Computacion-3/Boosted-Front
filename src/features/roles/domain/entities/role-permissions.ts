import { DomainError } from "@/src/core/errors/domain-error";

/** Permiso sin el cual nadie podría volver a editar los roles. */
export const ROLES_UPDATE_PERMISSION = "roles:update";

export const ADMIN_ROLE = "administrador";

/** Un permiso que existe en el sistema (`recurso:acción`) y para qué sirve. */
export class PermissionDefinition {
  constructor(
    readonly name: string,
    readonly description: string,
  ) {
    if (name.trim() === "") {
      throw new DomainError("El permiso no tiene nombre");
    }
  }
}

/** Un rol y los permisos que tiene asignados. */
export class RolePermissions {
  readonly role: string;
  readonly permissions: string[];

  constructor(role: string, permissions: string[]) {
    if (role.trim() === "") {
      throw new DomainError("El rol no tiene nombre");
    }
    this.role = role;
    // Sin repetidos y en orden, para poder comparar y mostrar siempre igual.
    this.permissions = [...new Set(permissions)].sort();
  }

  has(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
