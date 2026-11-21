import type { AuthRepository } from "../repositories/auth.repository";

/** Cerrar sesión: el token actual deja de servir. */
export class LogoutUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.repository.logout();
  }
}
