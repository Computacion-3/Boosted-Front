import { AuthTokens } from "../../domain/entities/auth-tokens";
import type { LoginParams } from "../../domain/repositories/auth.repository";
import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";

/** La «aduana» entre la API de autenticación y el dominio. */
export class AuthMapper {
  static toDomain(dto: LoginResponseDto): AuthTokens {
    return new AuthTokens(dto.accessToken ?? "");
  }

  static toLoginRequestDto(params: LoginParams): LoginRequestDto {
    return { email: params.email, password: params.password };
  }
}
