import { isUserRole, isUserStatus, ManagedUser } from "../../domain/entities/managed-user";
import type { UserDto } from "../dtos/user.dto";

/** La «aduana» entre la API de usuarios y el dominio. */
export class UserMapper {
  static toDomain(dto: UserDto): ManagedUser {
    return new ManagedUser({
      id: dto.id,
      name: dto.name ?? "",
      username: dto.username ?? "",
      email: dto.email ?? "",
      // Un rol o estado que el front no conoce no rompe la tabla: se toma el más restrictivo.
      role: isUserRole(dto.role) ? dto.role : "aficionado",
      status: isUserStatus(dto.status) ? dto.status : "inactivo",
      createdAt: new Date(dto.createdAt),
    });
  }
}
