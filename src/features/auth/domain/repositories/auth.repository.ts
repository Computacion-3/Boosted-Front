import type { AuthTokens } from "../entities/auth-tokens";

export type LoginParams = {
  email: string;
  password: string;
};

/** Puerto de autenticación: lo que el dominio necesita, sin hablar de HTTP ni de URLs. */
export interface AuthRepository {
  login(params: LoginParams): Promise<AuthTokens>;
}
