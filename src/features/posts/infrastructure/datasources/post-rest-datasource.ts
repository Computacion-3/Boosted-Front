import { apiClient } from "@/src/core/http/api-client";
import type { PaginatedPostsDto, PostQueryDto } from "../dtos/post.dto";
import type { PostDatasource } from "./post-datasource.interface";

/**
 * Publicaciones por REST. La lectura del feed es pública en la API, por eso `auth: "none"`.
 * Un `type` con varios valores viaja como clave repetida (`type=avance&type=compra`).
 */
export class PostRestDatasource implements PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto> {
    return apiClient.get<PaginatedPostsDto>("/posts", { auth: "none", query: { ...query } });
  }
}
