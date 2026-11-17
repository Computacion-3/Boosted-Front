import type { Paginated } from "@/src/core/domain/paginated";
import type { Post, PostType } from "../entities/post";

/** Filtros del feed. Los campos vacíos no filtran. */
export interface PostFilters {
  /** Uno o varios tipos: una publicación entra si es de cualquiera de ellos. */
  types?: PostType[];
  authorId?: string;
  /** UUID del vehículo. */
  vehicleId?: string;
  /** Texto a buscar en el título y en el contenido. */
  search?: string;
}

export interface PostQuery extends PostFilters {
  /** Desde 1. */
  page: number;
  /** De 1 a 50. */
  limit: number;
}

/**
 * Puerto del módulo de publicaciones: lo que el dominio necesita, sin decir cómo se obtiene.
 * Es el único puerto: un repositorio lo implementa y puede usar el datasource REST
 * o el GraphQL sin que el dominio se entere.
 */
export interface PostRepository {
  findAll(query: PostQuery): Promise<Paginated<Post>>;
}
