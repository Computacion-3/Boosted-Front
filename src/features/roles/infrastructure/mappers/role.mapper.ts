import { PermissionDefinition, RolePermissions } from "../../domain/entities/role-permissions";
import type { PermissionDto, RolePermissionsDto } from "../dtos/role.dto";

/** La «aduana» entre la API de roles y permisos y el dominio. */
export class RoleMapper {
  static toDomain(dto: RolePermissionsDto): RolePermissions {
    return new RolePermissions(dto.role, dto.permissions ?? []);
  }

  static toPermissionDomain(dto: PermissionDto): PermissionDefinition {
    return new PermissionDefinition(dto.name, dto.description ?? "");
  }
}
