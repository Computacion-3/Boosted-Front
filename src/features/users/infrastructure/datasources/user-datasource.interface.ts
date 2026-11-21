import type { UpdateRoleDto, UpdateStatusDto, UserDto } from "../dtos/user.dto";

/** Contrato de la fuente de datos de usuarios. Habla solo en DTO. */
export interface UserDatasource {
  getUsers(): Promise<UserDto[]>;
  updateRole(id: string, body: UpdateRoleDto): Promise<UserDto>;
  updateStatus(id: string, body: UpdateStatusDto): Promise<UserDto>;
}
