import { ApiError } from "./api-error";

// Cliente HTTP para hablar con la API de Boosted. Es una fábrica sin
// dependencias de Next ni de la sesión: quien la crea le pasa cómo obtener el
// token. Así se puede probar sola, y el cableado real (que lee la cookie de
// sesión en el servidor) vive en api-client.ts.

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * - `required` (por defecto): la ruta es privada; sin sesión lanza un error y
 *   no hace la petición.
 * - `optional`: adjunta el token si hay sesión; para rutas públicas que se
 *   comportan distinto con sesión.
 * - `none`: nunca adjunta el token.
 */
export type AuthMode = "required" | "optional" | "none";

type QueryValue = string | number | boolean | null | undefined;
/** Los valores `undefined`, `null` y "" se omiten; un arreglo repite la clave. */
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Se envía como JSON. */
  body?: unknown;
  query?: QueryParams;
  auth?: AuthMode;
  headers?: Record<string, string>;
  /** Para cancelar desde quien llama; la cancelación se propaga tal cual. */
  signal?: AbortSignal;
  /** Por defecto `no-store`: ver la nota en `request`. */
  cache?: RequestCache;
  timeoutMs?: number;
}

export type MethodOptions = Omit<RequestOptions, "method" | "body">;

export interface ApiClientConfig {
  /** Se admite una función para leer `API_URL` en cada petición y no al importar. */
  baseUrl: string | (() => string);
  getAccessToken: () => Promise<string | null | undefined>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      method = "GET",
      body,
      query,
      auth = "required",
      headers = {},
      signal,
      // En Next 16 el fetch sin opciones se ejecuta UNA vez durante
      // `next build` si la ruta se prerenderiza. Con datos de la API (y con
      // un backend que puede no estar disponible al construir) eso no sirve.
      cache = "no-store",
      timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    } = options;

    const token = auth === "none" ? null : await config.getAccessToken();
    if (auth === "required" && !token) {
      throw new ApiError(401, "No hay una sesión activa", "unauthenticated");
    }

    const requestHeaders = new Headers({ Accept: "application/json", ...headers });
    if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const abortSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    let response: Response;
    try {
      response = await (config.fetchImpl ?? fetch)(
        buildUrl(resolveBaseUrl(config.baseUrl), path, query),
        {
          method,
          headers: requestHeaders,
          body: body === undefined ? undefined : JSON.stringify(body),
          cache,
          signal: abortSignal,
        },
      );
    } catch (error) {
      if (signal?.aborted) throw error;
      if (timeoutSignal.aborted) {
        throw new ApiError(0, "El servidor tardó demasiado en responder", "timeout");
      }
      throw new ApiError(0, "No se pudo conectar con el servidor", "network");
    }

    if (!response.ok) {
      throw new ApiError(response.status, await readErrorMessage(response));
    }
    return (await readBody(response)) as T;
  }

  return {
    request,
    get: <T>(path: string, options?: MethodOptions) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: MethodOptions) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: MethodOptions) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: MethodOptions) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: MethodOptions) =>
      request<T>(path, { ...options, method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

function resolveBaseUrl(baseUrl: string | (() => string)): string {
  return typeof baseUrl === "function" ? baseUrl() : baseUrl;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(
    `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== undefined && item !== null && item !== "") {
        url.searchParams.append(key, String(item));
      }
    }
  }
  return url.toString();
}

// Nest responde `{ message, statusCode }`; en un 400 de validación `message`
// es un arreglo de textos.
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      const { message } = data as { message: unknown };
      if (Array.isArray(message)) return message.join(", ");
      if (typeof message === "string" && message) return message;
    }
  } catch {
    // cuerpo vacío o que no es JSON: se usa el mensaje genérico
  }
  return `La API respondió con el estado ${response.status}`;
}

// 204 y cuerpos vacíos dan `undefined`.
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(response.status, "La respuesta de la API no es JSON válido");
  }
}
