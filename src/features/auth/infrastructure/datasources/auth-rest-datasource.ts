import { apiClient } from "@/src/core/http/api-client";
import type { LoginRequestDto, LoginResponseDto } from "../dtos/login.dto";
import type { AuthDatasource } from "./auth-datasource.interface";

/**
 * Autenticación por REST. Si la API responde un error, apiClient lanza un
 * ApiError con el status (401, 403…).
 */
export class AuthRestDatasource implements AuthDatasource {
  /**
   * El login se hace SIN sesión, por eso `auth: "none"`: con el valor por
   * defecto ("required") el cliente respondería 401 sin llamar a la API.
   */
  login(body: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient.post<LoginResponseDto>("/auth/login", body, { auth: "none" });
  }

  /**
   * El logout manda el token de la sesión (Bearer, el valor por defecto): el
   * backend revoca justo ese token.
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }
}
