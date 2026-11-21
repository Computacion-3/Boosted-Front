// Espejo del JSON de usuarios de la API (entidad User del backend, sin la contraseña).

export interface UserDto {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  /** aficionado | moderador | administrador */
  role: string;
  /** activo | inactivo */
  status: string;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo de PATCH /users/:id/role */
export interface UpdateRoleDto {
  role: string;
}

/** Cuerpo de PATCH /users/:id/status */
export interface UpdateStatusDto {
  status: string;
}
