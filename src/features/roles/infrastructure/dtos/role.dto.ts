// Espejo del JSON de roles y permisos de la API.

/** Un elemento de GET /roles y la respuesta de PUT /roles/:role/permissions. */
export interface RolePermissionsDto {
  role: string;
  permissions: string[];
}

/** Un elemento de GET /permissions. */
export interface PermissionDto {
  id: string;
  name: string;
  description?: string | null;
}

/** Cuerpo de PUT /roles/:role/permissions (reemplaza la lista completa). */
export interface UpdateRolePermissionsDto {
  permissions: string[];
}
