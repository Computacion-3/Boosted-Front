import type { Paginated } from "@/src/core/domain/paginated";
import { DomainError } from "@/src/core/errors/domain-error";
import { isPostType, isVehicleId, type Post } from "../entities/post";
import type { PostQuery, PostRepository } from "../repositories/post.repository";

export const MAX_POSTS_PER_PAGE = 50;

/** Consultar el feed de publicaciones de la comunidad con filtros y paginación. */
export class GetPostsUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(query: PostQuery): Promise<Paginated<Post>> {
    if (!Number.isInteger(query.page) || query.page < 1) {
      throw new DomainError("La página debe ser un número mayor o igual a 1");
    }
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > MAX_POSTS_PER_PAGE) {
      throw new DomainError(
        `Se pueden pedir entre 1 y ${MAX_POSTS_PER_PAGE} publicaciones por página`,
      );
    }

    // Sin repetidos, y una lista vacía es lo mismo que no filtrar por tipo.
    const types = [...new Set(query.types ?? [])];
    if (!types.every(isPostType)) {
      throw new DomainError("Hay un tipo de publicación que no es válido");
    }

    const vehicleId = query.vehicleId?.trim() || undefined;
    if (vehicleId && !isVehicleId(vehicleId)) {
      throw new DomainError("El id del vehículo debe ser un UUID válido");
    }

    const result = await this.repository.findAll({
      page: query.page,
      limit: query.limit,
      types: types.length > 0 ? types : undefined,
      authorId: query.authorId?.trim() || undefined,
      vehicleId,
      search: query.search?.trim() || undefined,
    });

    // Las publicaciones ocultas por moderación nunca llegan a la pantalla, venga
    // el dato de REST o de GraphQL: la regla es del dominio, no de una API.
    return { ...result, items: result.items.filter((post) => post.isVisible()) };
  }
}
