import { DomainError } from "@/src/core/errors/domain-error";
import type { AuthTokens } from "../entities/auth-tokens";
import type { AuthRepository, LoginParams } from "../repositories/auth.repository";

/** Iniciar sesión con correo y contraseña. */
export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(params: LoginParams): Promise<AuthTokens> {
    // El correo no distingue mayúsculas ni espacios al inicio o al final.
    const email = params.email.trim().toLowerCase();

    if (email === "" || params.password === "") {
      throw new DomainError("Ingresa tu correo y tu contraseña");
    }

    return this.repository.login({ email, password: params.password });
  }
}
