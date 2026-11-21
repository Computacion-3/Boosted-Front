import "server-only";
import { ChangeUserRoleUseCase } from "../domain/usecases/change-user-role.usecase";
import { ChangeUserStatusUseCase } from "../domain/usecases/change-user-status.usecase";
import { GetUsersUseCase } from "../domain/usecases/get-users.usecase";
import { UserRestDatasource } from "../infrastructure/datasources/user-rest-datasource";
import { UserRepositoryImpl } from "../infrastructure/repositories/user.repository.impl";

/** Raíz de composición de la administración de usuarios. */
const repository = new UserRepositoryImpl(new UserRestDatasource());

export const usersContainer = {
  getUsers: new GetUsersUseCase(repository),
  changeUserRole: new ChangeUserRoleUseCase(repository),
  changeUserStatus: new ChangeUserStatusUseCase(repository),
};

export type UsersContainer = typeof usersContainer;
