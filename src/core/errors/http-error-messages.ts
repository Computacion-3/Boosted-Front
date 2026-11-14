/**
 * Traduce el status HTTP de la API a un mensaje en español para la persona.
 * La API (NestJS) responde los errores como { message, statusCode }; ese
 * `message` es técnico (y a veces en inglés), así que en pantalla se muestra este.
 */

export const UNEXPECTED_ERROR_MESSAGE = "Ocurrió un error inesperado. Intenta de nuevo.";

export const NETWORK_ERROR_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.";

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  0: NETWORK_ERROR_MESSAGE, // sin respuesta: red caída o tiempo de espera agotado
  400: "Los datos enviados no son válidos. Revisa el formulario.",
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscas.",
  409: "Ya existe un registro con esos datos.",
  429: "Hiciste demasiadas solicitudes. Espera un momento e intenta de nuevo.",
};

const SERVER_ERROR_MESSAGE = "El servidor tuvo un problema. Intenta de nuevo más tarde.";

/** Mensajes propios de una pantalla para algunos status, por ejemplo { 409: "Ese usuario ya existe" }. */
export type HttpErrorMessageOverrides = Partial<Record<number, string>>;

export function getHttpErrorMessage(
  status: number | undefined,
  overrides: HttpErrorMessageOverrides = {},
): string {
  if (status === undefined) return UNEXPECTED_ERROR_MESSAGE;

  const message = overrides[status] ?? HTTP_ERROR_MESSAGES[status];
  if (message) return message;

  return status >= 500 ? SERVER_ERROR_MESSAGE : UNEXPECTED_ERROR_MESSAGE;
}
