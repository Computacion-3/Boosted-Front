import type { PermissionDefinition, RolePermissions } from "../../domain/entities/role-permissions";
import type { RoleRepository } from "../../domain/repositories/role.repository";
import type { RoleDatasource } from "../datasources/role-datasource.interface";
import { RoleMapper } from "../mappers/role.mapper";

/** Implementa el puerto del dominio. Recibe el datasource por constructor. */
export class RoleRepositoryImpl implements RoleRepository {
  constructor(private readonly datasource: RoleDatasource) {}

  async findAllRoles(): Promise<RolePermissions[]> {
    const dtos = await this.datasource.getRoles();
    return dtos.map((dto) => RoleMapper.toDomain(dto));
  }

  async findAllPermissions(): Promise<PermissionDefinition[]> {
    const dtos = await this.datasource.getPermissions();
    return dtos.map((dto) => RoleMapper.toPermissionDomain(dto));
  }

  async updatePermissions(role: string, permissions: string[]): Promise<RolePermissions> {
    const dto = await this.datasource.updateRolePermissions(role, { permissions });
    return RoleMapper.toDomain(dto);
  }
}
