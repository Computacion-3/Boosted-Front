import type { RoleRepository, RolesOverview } from "../repositories/role.repository";

/** Auditoría: ver cada rol con sus permisos y la lista de permisos que existen. */
export class GetRolesOverviewUseCase {
  constructor(private readonly repository: RoleRepository) {}

  async execute(): Promise<RolesOverview> {
    const [roles, permissions] = await Promise.all([
      this.repository.findAllRoles(),
      this.repository.findAllPermissions(),
    ]);
    return { roles, permissions };
  }
}
