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
import { usersContainer } from "../../di/users.container";
import type { UserQuery } from "../../domain/repositories/user.repository";
import {
  ManagedUserViewModelMapper,
  type ManagedUserViewModel,
  type PaginatedUsersViewModel,
} from "../viewmodels/managed-user.viewmodel";

/*
 * Server Actions de la administración de usuarios. Cada una exige su permiso en
 * la primera línea, fuera del try/catch (una Server Action es un endpoint público).
 */

const NOT_FOUND = { 404: "Ese usuario ya no existe. Recarga la lista." };

/**
 * En los 400 de estas rutas el backend explica el motivo en español
 * (por ejemplo «No puedes cambiar tu propio rol o estado»): se muestra tal cual.
 */
function toUserActionError(error: unknown) {
  if (getErrorStatus(error) === 400 && error instanceof Error && error.message) {
    return actionError(error.message, 400);
  }
  return toActionError(error, NOT_FOUND);
}

export async function getUsersAction(query: UserQuery): Promise<ActionResult<PaginatedUsersViewModel>> {
  const session = await requirePermission(PERMISSIONS.USERS_READ);

  try {
    const result = await usersContainer.getUsers.execute(query);
    return actionOk({
      items: result.items.map((user) => ManagedUserViewModelMapper.toViewModel(user, session.userId)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function changeUserRoleAction(
  id: string,
  role: string,
): Promise<ActionResult<ManagedUserViewModel>> {
  const session = await requirePermission(PERMISSIONS.USERS_UPDATE_ROLE);

  try {
    const user = await usersContainer.changeUserRole.execute(id, role);
    return actionOk(ManagedUserViewModelMapper.toViewModel(user, session.userId));
  } catch (error) {
    return toUserActionError(error);
  }
}

export async function changeUserStatusAction(
  id: string,
  status: string,
): Promise<ActionResult<ManagedUserViewModel>> {
  const session = await requirePermission(PERMISSIONS.USERS_UPDATE_STATUS);

  try {
    const user = await usersContainer.changeUserStatus.execute(id, status);
    return actionOk(ManagedUserViewModelMapper.toViewModel(user, session.userId));
  } catch (error) {
    return toUserActionError(error);
  }
}
