import { apiClient } from "@/src/core/http/api-client";
import type { UpdateRoleDto, UpdateStatusDto, UserDto } from "../dtos/user.dto";
import type { UserDatasource } from "./user-datasource.interface";

/**
 * Usuarios por REST. Todas las rutas exigen sesión (Bearer, el valor por
 * defecto) y un permiso: `users:read`, `users:update-role` o `users:update-status`.
 */
export class UserRestDatasource implements UserDatasource {
  getUsers(): Promise<UserDto[]> {
    return apiClient.get<UserDto[]>("/users");
  }

  updateRole(id: string, body: UpdateRoleDto): Promise<UserDto> {
    return apiClient.patch<UserDto>(`/users/${encodeURIComponent(id)}/role`, body);
  }

  updateStatus(id: string, body: UpdateStatusDto): Promise<UserDto> {
    return apiClient.patch<UserDto>(`/users/${encodeURIComponent(id)}/status`, body);
  }
}
