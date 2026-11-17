import { apiClient } from "@/src/core/http/api-client";
import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";
import type { AuthDatasource } from "./auth-datasource.interface";

/**
 * Autenticación por REST. El login se hace SIN sesión, por eso `auth: "none"`:
 * con el valor por defecto ("required") el cliente respondería 401 sin llamar a la API.
 * Si la API responde 401 o 403, apiClient lanza un ApiError con ese status.
 */
export class AuthRestDatasource implements AuthDatasource {
  login(body: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient.post<LoginResponseDto>("/auth/login", body, { auth: "none" });
  }
}
