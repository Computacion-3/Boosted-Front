import type { PermissionDto, RolePermissionsDto, UpdateRolePermissionsDto } from "../dtos/role.dto";

/** Contrato de la fuente de datos de roles y permisos. Habla solo en DTO. */
export interface RoleDatasource {
  getRoles(): Promise<RolePermissionsDto[]>;
  getPermissions(): Promise<PermissionDto[]>;
  updateRolePermissions(role: string, body: UpdateRolePermissionsDto): Promise<RolePermissionsDto>;
}
