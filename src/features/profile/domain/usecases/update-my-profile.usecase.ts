import { DomainError } from "@/src/core/errors/domain-error";
import { validateProfileFields, type UserProfile } from "../entities/user-profile";
import type { ProfileRepository, UpdateProfileParams } from "../repositories/profile.repository";

/** Editar mi perfil. Limpia espacios, deja en null los opcionales vacíos y valida antes de llamar a la API. */
export class UpdateMyProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  async execute(params: UpdateProfileParams): Promise<UserProfile> {
    const clean: UpdateProfileParams = {};
    if (params.name !== undefined) clean.name = params.name.trim();
    if (params.username !== undefined) clean.username = params.username.trim();
    if (params.bio !== undefined) clean.bio = params.bio?.trim() || null;
    if (params.city !== undefined) clean.city = params.city?.trim() || null;
    if (params.country !== undefined) clean.country = params.country?.trim() || null;
    if (params.avatarUrl !== undefined) clean.avatarUrl = params.avatarUrl?.trim() || null;

    if (Object.keys(clean).length === 0) {
      throw new DomainError("No hay cambios para guardar");
    }
    validateProfileFields(clean);
    return this.repository.updateMine(clean);
  }
}
