import { AuthTokens } from "../../domain/entities/auth-tokens";
import type { LoginParams, RegisterParams } from "../../domain/repositories/auth.repository";
import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";
import type { RegisterRequestDto } from "../dtos/register.dto";

/** La «aduana» entre la API de autenticación y el dominio. */
export class AuthMapper {
  static toDomain(dto: LoginResponseDto): AuthTokens {
    return new AuthTokens(dto.accessToken ?? "");
  }

  static toLoginRequestDto(params: LoginParams): LoginRequestDto {
    return { email: params.email, password: params.password };
  }

  /** Solo incluye los opcionales que traen valor. */
  static toRegisterRequestDto(params: RegisterParams): RegisterRequestDto {
    return {
      name: params.name,
      username: params.username,
      email: params.email,
      password: params.password,
      ...(params.city ? { city: params.city } : {}),
      ...(params.country ? { country: params.country } : {}),
      ...(params.bio ? { bio: params.bio } : {}),
    };
  }
}
