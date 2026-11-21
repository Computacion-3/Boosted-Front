import type { PermissionDefinition, RolePermissions } from "../../domain/entities/role-permissions";
import type { RolesOverview } from "../../domain/repositories/role.repository";

/** Un rol con sus permisos, listo para pintar (va a Redux). */
export interface RoleViewModel {
  readonly role: string;
  /** "Administrador", "Moderador"… */
  readonly roleLabel: string;
  readonly permissions: string[];
}

/** Un permiso del sistema con su explicación. */
export interface PermissionViewModel {
  readonly name: string;
  readonly description: string;
}

export interface RolesOverviewViewModel {
  readonly roles: RoleViewModel[];
  readonly permissions: PermissionViewModel[];
}

const ROLE_LABELS: Record<string, string> = {
  aficionado: "Aficionado",
  moderador: "Moderador",
  administrador: "Administrador",
};

/** Orden en que se muestran los roles: de menos a más permisos por defecto. */
const ROLE_ORDER = ["aficionado", "moderador", "administrador"];

export class RoleViewModelMapper {
  static toViewModel(role: RolePermissions): RoleViewModel {
    return {
      role: role.role,
      roleLabel: ROLE_LABELS[role.role] ?? role.role,
      permissions: [...role.permissions],
    };
  }

  static toPermissionViewModel(permission: PermissionDefinition): PermissionViewModel {
    return { name: permission.name, description: permission.description };
  }

  static toOverviewViewModel(overview: RolesOverview): RolesOverviewViewModel {
    const position = (role: string) => {
      const index = ROLE_ORDER.indexOf(role);
      return index === -1 ? ROLE_ORDER.length : index;
    };
    return {
      roles: overview.roles
        .map((role) => RoleViewModelMapper.toViewModel(role))
        .sort((a, b) => position(a.role) - position(b.role)),
      permissions: overview.permissions.map((permission) =>
        RoleViewModelMapper.toPermissionViewModel(permission),
      ),
    };
  }
}
