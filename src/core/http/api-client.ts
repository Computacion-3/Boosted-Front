import "server-only";
import { getSession } from "@/src/lib/dal";
import { createApiClient } from "./http-client";

/**
 * El cliente HTTP de la aplicación para hablar con la API de Boosted. Solo
 * existe en el servidor: lo importan los datasources, que a su vez solo se
 * usan desde contenedores `server-only` y Server Actions.
 *
 * Lee el token de la cookie de sesión con `getSession()` (nunca llega al
 * navegador) y lo manda como `Authorization: Bearer`.
 *
 * Ejemplo, en un datasource:
 *
 *   // ruta pública: no hace falta sesión
 *   apiClient.get<PaginatedEventsDto>("/events", { auth: "none", query: { page, city } });
 *
 *   // ruta privada (`auth: "required"` es el valor por defecto)
 *   apiClient.post<VehicleDto>("/vehicles", body);
 *
 *   // pública, pero con sesión se comporta distinto
 *   apiClient.get<PostDto>(`/posts/${id}`, { auth: "optional" });
 *
 * Si la respuesta no es 2xx lanza un `ApiError` (ver api-error.ts). Con
 * `auth: "required"` y sin sesión lanza un `ApiError` 401 sin hacer la petición.
 */
export const apiClient = createApiClient({
  // Se lee en cada petición y no al importar el módulo: así `next build` no
  // exige la variable y un valor faltante da un error claro al usarla.
  baseUrl: () => {
    const url = process.env.API_URL;
    if (!url) {
      throw new Error("Falta la variable de entorno API_URL (ver .env.example)");
    }
    return url;
  },
  getAccessToken: async () => (await getSession())?.accessToken ?? null,
});
