import { UserProfile } from "../../domain/entities/user-profile";
import type { UpdateProfileParams } from "../../domain/repositories/profile.repository";
import type { ProfileDto, UpdateProfileDto } from "../dtos/profile.dto";

/** La «aduana» entre el JSON de la API y el dominio. */
export class ProfileMapper {
  static toDomain(dto: ProfileDto): UserProfile {
    return new UserProfile({
      id: dto.id,
      name: dto.name,
      username: dto.username,
      email: dto.email,
      bio: dto.bio ?? null,
      city: dto.city ?? null,
      country: dto.country ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      role: dto.role,
      createdAt: new Date(dto.createdAt),
    });
  }

  /** Solo se mandan los campos presentes; los demás no se tocan en el backend. */
  static toUpdateDto(params: UpdateProfileParams): UpdateProfileDto {
    const dto: UpdateProfileDto = {};
    if (params.name !== undefined) dto.name = params.name;
    if (params.username !== undefined) dto.username = params.username;
    if (params.bio !== undefined) dto.bio = params.bio;
    if (params.city !== undefined) dto.city = params.city;
    if (params.country !== undefined) dto.country = params.country;
    if (params.avatarUrl !== undefined) dto.avatarUrl = params.avatarUrl;
    return dto;
  }
}
