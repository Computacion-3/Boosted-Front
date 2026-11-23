"use server";

import {
  actionError,
  actionOk,
  getErrorStatus,
  toActionError,
  type ActionResult,
} from "@/src/core/errors";
import { PERMISSIONS } from "@/src/core/permissions";
import { requirePermission } from "@/src/lib/dal";
import { rolesContainer } from "../../di/roles.container";
import {
  RoleViewModelMapper,
  type RoleViewModel,
  type RolesOverviewViewModel,
} from "../viewmodels/role.viewmodel";

/*
 * Server Actions de roles y permisos. Cada una exige su permiso en la primera
 * línea, fuera del try/catch.
 */

export async function getRolesOverviewAction(): Promise<ActionResult<RolesOverviewViewModel>> {
  await requirePermission(PERMISSIONS.ROLES_READ);

  try {
    const overview = await rolesContainer.getRolesOverview.execute();
    return actionOk(RoleViewModelMapper.toOverviewViewModel(overview));
  } catch (error) {
    return toActionError(error);
  }
}

/** Reemplaza la lista completa de permisos del rol. */
export async function updateRolePermissionsAction(
  role: string,
  permissions: string[],
): Promise<ActionResult<RoleViewModel>> {
  await requirePermission(PERMISSIONS.ROLES_UPDATE);

  try {
    const updated = await rolesContainer.updateRolePermissions.execute(role, permissions);
    return actionOk(RoleViewModelMapper.toViewModel(updated));
  } catch (error) {
    // En el 400 el backend explica el motivo en español («Permisos inexistentes…»,
    // «El rol administrador no puede perder…»): se muestra tal cual.
    if (getErrorStatus(error) === 400 && error instanceof Error && error.message) {
      return actionError(error.message, 400);
    }
    return toActionError(error);
  }
}
