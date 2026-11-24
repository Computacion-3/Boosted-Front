// Espejo del JSON de GET/PATCH /users/me (entidad User del backend, sin la contraseña).

export interface ProfileDto {
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

/** Cuerpo de PATCH /users/me. La API rechaza (400) cualquier otro campo, como email o password. */
export interface UpdateProfileDto {
  name?: string;
  username?: string;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
}
