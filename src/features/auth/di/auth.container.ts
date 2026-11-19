import "server-only";
import { LoginUseCase } from "../domain/usecases/login.usecase";
import { LogoutUseCase } from "../domain/usecases/logout.usecase";
import { AuthRestDatasource } from "../infrastructure/datasources/auth-rest-datasource";
import { AuthRepositoryImpl } from "../infrastructure/repositories/auth.repository.impl";

/**
 * Raíz de composición de autenticación: el único archivo que conoce las clases
 * concretas. Solo existe en el servidor (lo usan las Server Actions).
 */
const repository = new AuthRepositoryImpl(new AuthRestDatasource());

export const authContainer = {
  login: new LoginUseCase(repository),
  logout: new LogoutUseCase(repository),
};

export type AuthContainer = typeof authContainer;
