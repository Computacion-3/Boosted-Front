import type { UserProfile } from "../entities/user-profile";
import type { ProfileRepository } from "../repositories/profile.repository";

/** Ver mi perfil. */
export class GetMyProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  execute(): Promise<UserProfile> {
    return this.repository.getMine();
  }
}
