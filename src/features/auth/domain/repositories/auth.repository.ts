import type { AuthTokens } from "../entities/auth-tokens";

export type LoginParams = {
  email: string;
  password: string;
};

/** Puerto de autenticación: lo que el dominio necesita, sin hablar de HTTP ni de URLs. */
export interface AuthRepository {
  login(params: LoginParams): Promise<AuthTokens>;
  /** Invalida el token de la sesión actual para que ya no sirva aunque no haya vencido. */
  logout(): Promise<void>;
}
