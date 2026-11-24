import { apiClient } from "@/src/core/http/api-client";
import type { ProfileDto, UpdateProfileDto } from "../dtos/profile.dto";
import type { ProfileDatasource } from "./profile-datasource.interface";

/** Perfil por REST. /users/me exige sesión: el backend sabe quién es por el token. */
export class ProfileRestDatasource implements ProfileDatasource {
  getMe(): Promise<ProfileDto> {
    return apiClient.get<ProfileDto>("/users/me");
  }

  updateMe(dto: UpdateProfileDto): Promise<ProfileDto> {
    return apiClient.patch<ProfileDto>("/users/me", dto);
  }
}
