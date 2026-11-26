import { DomainError } from "@/src/core/errors/domain-error";

/**
 * Lo que entrega el backend al iniciar sesión: el token de acceso (JWT).
 * El dominio no sabe dónde se guarda (cookie) ni cómo viaja (Bearer).
 */
export class AuthTokens {
  constructor(readonly accessToken: string) {
    if (accessToken.trim() === "") {
      throw new DomainError("El token de acceso está vacío");
    }
  }
}
