import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";
import type { RegisterRequestDto } from "../dtos/register.dto";

/** Contrato de la fuente de datos de autenticación. Habla solo en DTO. */
export interface AuthDatasource {
  login(body: LoginRequestDto): Promise<LoginResponseDto>;
  register(body: RegisterRequestDto): Promise<void>;
  logout(): Promise<void>;
}
