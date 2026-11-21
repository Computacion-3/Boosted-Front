import type { Paginated } from "@/src/core/domain/paginated";
import { DomainError } from "@/src/core/errors/domain-error";
import type { ManagedUser } from "../entities/managed-user";
import type { UserQuery, UserRepository } from "../repositories/user.repository";

export const MAX_USERS_PER_PAGE = 50;

/**
 * Listar usuarios con búsqueda y paginación. La API devuelve todas las cuentas
 * de una vez, así que la búsqueda y la paginación se hacen aquí.
 */
export class GetUsersUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: UserQuery): Promise<Paginated<ManagedUser>> {
    if (!Number.isInteger(query.page) || query.page < 1) {
      throw new DomainError("La página debe ser un número mayor o igual a 1");
    }
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > MAX_USERS_PER_PAGE) {
      throw new DomainError(`Se pueden pedir entre 1 y ${MAX_USERS_PER_PAGE} usuarios por página`);
    }

    const all = await this.repository.findAll();
    const matching = all.filter((user) => user.matches(query.search ?? ""));
    const start = (query.page - 1) * query.limit;

    return {
      items: matching.slice(start, start + query.limit),
      total: matching.length,
      page: query.page,
      limit: query.limit,
    };
  }
}
