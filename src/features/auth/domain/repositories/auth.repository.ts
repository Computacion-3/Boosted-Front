import type { AuthTokens } from "../entities/auth-tokens";

export type LoginParams = {
  email: string;
  password: string;
};

/** Datos para crear una cuenta. El rol no se elige: el backend siempre crea aficionados. */
export type RegisterParams = {
  name: string;
  username: string;
  email: string;
  password: string;
  city?: string;
  country?: string;
  bio?: string;
};

/** Puerto de autenticación: lo que el dominio necesita, sin hablar de HTTP ni de URLs. */
export interface AuthRepository {
  login(params: LoginParams): Promise<AuthTokens>;
  /** Crea la cuenta. No inicia sesión: después del registro la persona va a /login. */
  register(params: RegisterParams): Promise<void>;
  /** Invalida el token de la sesión actual para que ya no sirva aunque no haya vencido. */
  logout(): Promise<void>;
}
