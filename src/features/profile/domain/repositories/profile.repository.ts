import type { ProfileFields, UserProfile } from "../entities/user-profile";

/** Cambios al perfil: solo los campos que vienen se guardan; null borra un opcional. */
export type UpdateProfileParams = Partial<ProfileFields>;

/** Puerto del perfil propio. Siempre es el de quien tiene la sesión (GET/PATCH /users/me). */
export interface ProfileRepository {
  getMine(): Promise<UserProfile>;
  updateMine(params: UpdateProfileParams): Promise<UserProfile>;
}
