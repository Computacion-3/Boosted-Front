import {
  USER_ROLES,
  type ManagedUser,
  type UserRole,
  type UserStatus,
} from "../../domain/entities/managed-user";

// Los componentes usan estos tipos desde el ViewModel, no desde la entidad.
export type { UserRole, UserStatus };

/** Una fila de la tabla de usuarios: datos planos y serializables (van a Redux). */
export interface ManagedUserViewModel {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly roleLabel: string;
  readonly status: UserStatus;
  readonly statusLabel: string;
  readonly isActive: boolean;
  /** true si es la cuenta de quien mira: no puede cambiarse su propio rol ni estado. */
  readonly isSelf: boolean;
}

export interface PaginatedUsersViewModel {
  readonly items: ManagedUserViewModel[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  aficionado: "Aficionado",
  moderador: "Moderador",
  administrador: "Administrador",
};

/** Opciones del selector de rol, en orden. */
export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = USER_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABELS[role],
}));

const USER_STATUS_LABELS: Record<UserStatus, string> = {
  activo: "Activa",
  inactivo: "Desactivada",
};

export class ManagedUserViewModelMapper {
  static toViewModel(user: ManagedUser, viewerId: string): ManagedUserViewModel {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      roleLabel: USER_ROLE_LABELS[user.role],
      status: user.status,
      statusLabel: USER_STATUS_LABELS[user.status],
      isActive: user.isActive(),
      isSelf: user.id === viewerId,
    };
  }
}
