import { apiClient } from "@/src/core/http/api-client";
import type { PaginatedPostsDto, PostDto, PostQueryDto } from "../dtos/post.dto";
import type { PostDatasource } from "./post-datasource.interface";

/**
 * Publicaciones por REST. La lectura del feed es pública en la API, por eso `auth: "none"`.
 * Dar like exige sesión (`auth: "required"`, el valor por defecto).
 * Un `type` con varios valores viaja como clave repetida (`type=avance&type=compra`).
 */
export class PostRestDatasource implements PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto> {
    return apiClient.get<PaginatedPostsDto>("/posts", { auth: "none", query: { ...query } });
  }

  toggleLike(id: string): Promise<PostDto> {
    return apiClient.post<PostDto>(`/posts/${encodeURIComponent(id)}/like`);
  }
}
