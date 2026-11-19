/** Cuerpo de POST /auth/login, tal como lo espera la API. */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * Respuesta de POST /auth/login. El front solo usa `accessToken`: los datos del
 * usuario (nombre, rol, permisos) se leen del propio token al crear la sesión.
 */
export interface LoginResponseDto {
  accessToken: string;
  user: unknown;
}
