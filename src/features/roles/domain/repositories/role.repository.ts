import type { PermissionDefinition, RolePermissions } from "../entities/role-permissions";

/** Cada rol con sus permisos y la lista de permisos que existen (auditoría). */
export interface RolesOverview {
  roles: RolePermissions[];
  permissions: PermissionDefinition[];
}

/** Puerto de roles y permisos (auditoría y edición). */
export interface RoleRepository {
  /** Cada rol con sus permisos. */
  findAllRoles(): Promise<RolePermissions[]>;
  /** Todos los permisos que existen en el sistema. */
  findAllPermissions(): Promise<PermissionDefinition[]>;
  /** Reemplaza la lista COMPLETA de permisos del rol. */
  updatePermissions(role: string, permissions: string[]): Promise<RolePermissions>;
}
