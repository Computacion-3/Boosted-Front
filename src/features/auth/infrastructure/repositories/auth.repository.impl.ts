import type { AuthTokens } from "../../domain/entities/auth-tokens";
import type {
  AuthRepository,
  LoginParams,
  RegisterParams,
} from "../../domain/repositories/auth.repository";
import type { AuthDatasource } from "../datasources/auth-datasource.interface";
import { AuthMapper } from "../mappers/auth.mapper";

/** Implementa el puerto del dominio. Recibe el datasource por constructor. */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly datasource: AuthDatasource) {}

  async login(params: LoginParams): Promise<AuthTokens> {
    const dto = await this.datasource.login(AuthMapper.toLoginRequestDto(params));
    return AuthMapper.toDomain(dto);
  }

  register(params: RegisterParams): Promise<void> {
    return this.datasource.register(AuthMapper.toRegisterRequestDto(params));
  }

  logout(): Promise<void> {
    return this.datasource.logout();
  }
}
