import type { ProfileDto, UpdateProfileDto } from "../dtos/profile.dto";

/** Fuente de datos del perfil propio. Devuelve DTO; el repositorio los convierte en entidades. */
export interface ProfileDatasource {
  getMe(): Promise<ProfileDto>;
  updateMe(dto: UpdateProfileDto): Promise<ProfileDto>;
}
