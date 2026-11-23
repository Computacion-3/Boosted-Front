import { DomainError } from "@/src/core/errors/domain-error";

/** Roles de Boosted (igual que el enum Role del backend). */
export const USER_ROLES = ["aficionado", "moderador", "administrador"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Estados de una cuenta (igual que el enum UserStatus del backend). */
export const USER_STATUSES = ["activo", "inactivo"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value);
}

export interface ManagedUserProps {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

/** Una cuenta registrada, vista desde la administración. */
export class ManagedUser {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly createdAt: Date;

  constructor(props: ManagedUserProps) {
    if (props.id.trim() === "") {
      throw new DomainError("El usuario no tiene id");
    }
    if (!isUserRole(props.role)) {
      throw new DomainError("El rol del usuario no es válido");
    }
    if (!isUserStatus(props.status)) {
      throw new DomainError("El estado del usuario no es válido");
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.username = props.username.trim();
    this.email = props.email.trim();
    this.role = props.role;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  isActive(): boolean {
    return this.status === "activo";
  }

  /** true si el texto aparece en el nombre, el usuario o el correo (sin distinguir mayúsculas). */
  matches(search: string): boolean {
    const text = search.trim().toLowerCase();
    if (text === "") return true;
    return [this.name, this.username, this.email].some((value) =>
      value.toLowerCase().includes(text),
    );
  }
}
