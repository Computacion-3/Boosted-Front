import type { Paginated } from "@/src/core/domain/paginated";
import type { Post, PostType } from "../entities/post";
import type { PostDraft } from "../entities/post-draft";

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
  /** Trae una publicación por id; lanza si no existe. */
  findById(id: string): Promise<Post>;
  /** Crea la publicación; el borrador llega ya validado por el caso de uso. */
  create(draft: PostDraft): Promise<Post>;
  /** Reemplaza los campos editables de la publicación con los del borrador, ya validado. */
  update(id: string, draft: PostDraft): Promise<Post>;
  /** Elimina la publicación. */
  remove(id: string): Promise<void>;
  /** La API alterna el like: si ya lo había lo quita y si no lo agrega. Devuelve la publicación actualizada. */
  toggleLike(id: string): Promise<Post>;
}
