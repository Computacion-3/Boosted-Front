import { DomainError } from "@/src/core/errors/domain-error";
import type { AuthRepository, RegisterParams } from "../repositories/auth.repository";

/** Crear una cuenta en la plataforma. */
export class RegisterUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(params: RegisterParams): Promise<void> {
    const name = params.name.trim();
    const username = params.username.trim();
    // El correo no distingue mayúsculas ni espacios al inicio o al final.
    const email = params.email.trim().toLowerCase();

    if (name === "" || username === "" || email === "" || params.password === "") {
      throw new DomainError("Completa nombre, usuario, correo y contraseña");
    }

    await this.repository.register({
      name,
      username,
      email,
      password: params.password,
      // Los opcionales vacíos no se mandan.
      city: params.city?.trim() || undefined,
      country: params.country?.trim() || undefined,
      bio: params.bio?.trim() || undefined,
    });
  }
}
