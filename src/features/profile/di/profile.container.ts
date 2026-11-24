import "server-only";
import { GetMyProfileUseCase } from "../domain/usecases/get-my-profile.usecase";
import { UpdateMyProfileUseCase } from "../domain/usecases/update-my-profile.usecase";
import { ProfileRestDatasource } from "../infrastructure/datasources/profile-rest-datasource";
import { ProfileRepositoryImpl } from "../infrastructure/repositories/profile.repository.impl";

/** Raíz de composición del perfil: el único archivo que conoce las clases concretas. */
const repository = new ProfileRepositoryImpl(new ProfileRestDatasource());

export const profileContainer = {
  getMyProfile: new GetMyProfileUseCase(repository),
  updateMyProfile: new UpdateMyProfileUseCase(repository),
};

export type ProfileContainer = typeof profileContainer;
