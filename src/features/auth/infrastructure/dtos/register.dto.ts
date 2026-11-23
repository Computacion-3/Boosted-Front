/**
 * Cuerpo de POST /auth/register, tal como lo espera la API. No lleva `role`:
 * si se manda, el backend responde 400 (siempre crea aficionados).
 * La respuesta es la misma que la del login (`LoginResponseDto`), pero el front
 * no la usa: después de registrarse la persona inicia sesión en /login.
 */
export interface RegisterRequestDto {
  name: string;
  username: string;
  email: string;
  password: string;
  city?: string;
  country?: string;
  bio?: string;
}
