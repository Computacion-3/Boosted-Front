import "server-only";
import { getSession } from "@/src/lib/dal";
import { GraphQLRequestError } from "./graphql-error";

// Cliente GraphQL para hablar con la API de Boosted. Solo existe en el
// servidor: lee el token de la cookie de sesión con `getSession()` y lo manda
// como `Authorization: Bearer`, así que nunca llega al navegador.

const TIMEOUT_MS = 10_000;

/**
 * - `required` (por defecto): sin sesión lanza un error 401 y no hace la petición.
 * - `optional`: adjunta el token si hay sesión.
 * - `none`: nunca adjunta el token.
 */
export type GraphQLAuthMode = "required" | "optional" | "none";

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: { auth?: GraphQLAuthMode; signal?: AbortSignal } = {},
): Promise<T> {
  const { auth = "required", signal } = options;

  // Se lee en cada petición y no al importar el módulo.
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL (ver .env.example)");
  }

  const token = auth === "none" ? null : (await getSession())?.accessToken;
  if (auth === "required" && !token) {
    throw new GraphQLRequestError(401, "No hay una sesión activa");
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS);
  const abortSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/+$/, "")}/graphql`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: abortSignal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeoutSignal.aborted) {
      throw new GraphQLRequestError(0, "El servidor tardó demasiado en responder");
    }
    throw new GraphQLRequestError(0, "No se pudo conectar con el servidor");
  }

  if (!response.ok) {
    throw new GraphQLRequestError(
      response.status,
      await readHttpErrorMessage(response),
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new GraphQLRequestError(
      response.status,
      "La respuesta de la API no es JSON válido",
    );
  }

  const { data, errors } = (body ?? {}) as { data?: unknown; errors?: unknown };

  // GraphQL reporta los errores con HTTP 200, dentro de `errors`.
  if (Array.isArray(errors) && errors.length > 0) {
    throw toGraphQLError(errors[0]);
  }
  if (data === undefined || data === null) {
    throw new GraphQLRequestError(500, "La respuesta de GraphQL no trae datos");
  }
  return data as T;
}

// Une un `message` que puede ser texto o arreglo de textos (validaciones).
function joinMessage(message: unknown): string | null {
  if (Array.isArray(message)) return message.join(", ") || null;
  if (typeof message === "string" && message) return message;
  return null;
}

// Nest responde `{ message, statusCode }` también en los errores HTTP.
async function readHttpErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      const message = joinMessage((data as { message: unknown }).message);
      if (message) return message;
    }
  } catch {
    // cuerpo vacío o que no es JSON: se usa el mensaje genérico
  }
  return `La API respondió con el estado ${response.status}`;
}

// Apollo siempre marca `extensions.code` como INTERNAL_SERVER_ERROR para las
// excepciones de Nest, así que el status real sale de `originalError.statusCode`
// (un 404 llega como INTERNAL_SERVER_ERROR). En una validación,
// `originalError.message` es un arreglo y `message` solo dice "Bad Request Exception".
function toGraphQLError(graphqlError: unknown): GraphQLRequestError {
  const error = (graphqlError ?? {}) as {
    message?: unknown;
    extensions?: { originalError?: { message?: unknown; statusCode?: unknown } };
  };
  const original = error.extensions?.originalError;

  const status =
    typeof original?.statusCode === "number" ? original.statusCode : 500;
  const message =
    joinMessage(original?.message) ??
    joinMessage(error.message) ??
    "Error en la respuesta de GraphQL";

  return new GraphQLRequestError(status, message);
}
