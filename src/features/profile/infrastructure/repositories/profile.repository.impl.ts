import type { UserProfile } from "../../domain/entities/user-profile";
import type {
  ProfileRepository,
  UpdateProfileParams,
} from "../../domain/repositories/profile.repository";
import type { ProfileDatasource } from "../datasources/profile-datasource.interface";
import { ProfileMapper } from "../mappers/profile.mapper";

/** Implementa el puerto del perfil. Recibe el datasource por constructor. */
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly datasource: ProfileDatasource) {}

  async getMine(): Promise<UserProfile> {
    return ProfileMapper.toDomain(await this.datasource.getMe());
  }

  async updateMine(params: UpdateProfileParams): Promise<UserProfile> {
    const dto = await this.datasource.updateMe(ProfileMapper.toUpdateDto(params));
    return ProfileMapper.toDomain(dto);
  }
}
