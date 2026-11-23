/**
 * Permisos de Boosted, con el mismo nombre que usa el backend (`recurso:acción`)
 * y que viajan en el JWT (`permissions`). Usa siempre estas constantes en vez de
 * escribir el texto a mano: un error de tipeo no daría error, solo escondería un botón.
 *
 * Por defecto: el aficionado no tiene ninguno, el moderador tiene `posts:moderate`
 * y el administrador tiene todos. Se gestionan en el backend
 * (`GET /permissions`, `GET /roles`, `PUT /roles/:role/permissions`).
 *
 * Los permisos del token solo deciden qué muestra la interfaz. Quien protege de
 * verdad es el backend (responde 403) y, en el front, el DAL y cada Server Action.
 */
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_UPDATE_ROLE: "users:update-role",
  USERS_UPDATE_STATUS: "users:update-status",
  POSTS_MODERATE: "posts:moderate",
  ROLES_READ: "roles:read",
  ROLES_UPDATE: "roles:update",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
