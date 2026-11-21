import { apiClient } from "@/src/core/http/api-client";
import type { PermissionDto, RolePermissionsDto, UpdateRolePermissionsDto } from "../dtos/role.dto";
import type { RoleDatasource } from "./role-datasource.interface";

/**
 * Roles y permisos por REST. Leer exige `roles:read`; editar exige `roles:update`
 * (Bearer de la sesión, el valor por defecto de apiClient).
 */
export class RoleRestDatasource implements RoleDatasource {
  getRoles(): Promise<RolePermissionsDto[]> {
    return apiClient.get<RolePermissionsDto[]>("/roles");
  }

  getPermissions(): Promise<PermissionDto[]> {
    return apiClient.get<PermissionDto[]>("/permissions");
  }

  updateRolePermissions(role: string, body: UpdateRolePermissionsDto): Promise<RolePermissionsDto> {
    return apiClient.put<RolePermissionsDto>(`/roles/${encodeURIComponent(role)}/permissions`, body);
  }
}
