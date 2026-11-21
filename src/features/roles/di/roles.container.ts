import "server-only";
import { GetRolesOverviewUseCase } from "../domain/usecases/get-roles-overview.usecase";
import { UpdateRolePermissionsUseCase } from "../domain/usecases/update-role-permissions.usecase";
import { RoleRestDatasource } from "../infrastructure/datasources/role-rest-datasource";
import { RoleRepositoryImpl } from "../infrastructure/repositories/role.repository.impl";

/** Raíz de composición de roles y permisos. */
const repository = new RoleRepositoryImpl(new RoleRestDatasource());

export const rolesContainer = {
  getRolesOverview: new GetRolesOverviewUseCase(repository),
  updateRolePermissions: new UpdateRolePermissionsUseCase(repository),
};

export type RolesContainer = typeof rolesContainer;
