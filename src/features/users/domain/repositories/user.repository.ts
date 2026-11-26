import type { ManagedUser, UserRole, UserStatus } from "../entities/managed-user";

/** Consulta del listado de usuarios de la administración. */
export interface UserQuery {
  page: number;
  limit: number;
  /** Texto a buscar en nombre, usuario o correo. */
  search?: string;
}

/** Puerto de usuarios para la administración. */
export interface UserRepository {
  /** Todas las cuentas registradas (la API no pagina este listado). */
  findAll(): Promise<ManagedUser[]>;
  updateRole(id: string, role: UserRole): Promise<ManagedUser>;
  updateStatus(id: string, status: UserStatus): Promise<ManagedUser>;
}
