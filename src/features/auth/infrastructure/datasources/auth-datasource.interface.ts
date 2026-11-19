import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";

/** Contrato de la fuente de datos de autenticación. Habla solo en DTO. */
export interface AuthDatasource {
  login(body: LoginRequestDto): Promise<LoginResponseDto>;
}
