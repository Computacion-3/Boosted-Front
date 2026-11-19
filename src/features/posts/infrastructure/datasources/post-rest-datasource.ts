import { apiClient } from "@/src/core/http/api-client";
import type { DeletedDto, PaginatedPostsDto, PostBodyDto, PostDto, PostQueryDto } from "../dtos/post.dto";
import type { PostDatasource } from "./post-datasource.interface";

/**
 * Publicaciones por REST. La lectura del feed es pública en la API, por eso `auth: "none"`;
 * el detalle usa `auth: "optional"` (con sesión, la API sabe quién mira).
 * Escribir (crear, editar, borrar, dar like) exige sesión (`auth: "required"`, el valor por defecto).
 * Un `type` con varios valores viaja como clave repetida (`type=avance&type=compra`).
 */
export class PostRestDatasource implements PostDatasource {
  getPosts(query: PostQueryDto): Promise<PaginatedPostsDto> {
    return apiClient.get<PaginatedPostsDto>("/posts", { auth: "none", query: { ...query } });
  }

  toggleLike(id: string): Promise<PostDto> {
    return apiClient.post<PostDto>(`/posts/${encodeURIComponent(id)}/like`);
  }

  getPostById(id: string): Promise<PostDto> {
    return apiClient.get<PostDto>(`/posts/${encodeURIComponent(id)}`, { auth: "optional" });
  }

  createPost(body: PostBodyDto): Promise<PostDto> {
    return apiClient.post<PostDto>("/posts", body);
  }

  updatePost(id: string, body: PostBodyDto): Promise<PostDto> {
    return apiClient.patch<PostDto>(`/posts/${encodeURIComponent(id)}`, body);
  }

  deletePost(id: string): Promise<DeletedDto> {
    return apiClient.delete<DeletedDto>(`/posts/${encodeURIComponent(id)}`);
  }
}
