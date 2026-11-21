import type { ManagedUser, UserRole, UserStatus } from "../../domain/entities/managed-user";
import type { UserRepository } from "../../domain/repositories/user.repository";
import type { UserDatasource } from "../datasources/user-datasource.interface";
import { UserMapper } from "../mappers/user.mapper";

/** Implementa el puerto del dominio. Recibe el datasource por constructor. */
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly datasource: UserDatasource) {}

  async findAll(): Promise<ManagedUser[]> {
    const dtos = await this.datasource.getUsers();
    return dtos.map((dto) => UserMapper.toDomain(dto));
  }

  async updateRole(id: string, role: UserRole): Promise<ManagedUser> {
    return UserMapper.toDomain(await this.datasource.updateRole(id, { role }));
  }

  async updateStatus(id: string, status: UserStatus): Promise<ManagedUser> {
    return UserMapper.toDomain(await this.datasource.updateStatus(id, { status }));
  }
}
