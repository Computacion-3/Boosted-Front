// Por qué una llamada a la API no devolvió lo esperado, y cuándo no hubo una
// respuesta HTTP que interpretar (`status` 0).
export type ApiErrorCode = "unauthenticated" | "timeout" | "network";

export class ApiError extends Error {
  /** Código HTTP de la respuesta; 0 si no hubo respuesta (red o tiempo de espera). */
  readonly status: number;
  /** Solo para los errores que no vienen de la API. */
  readonly code?: ApiErrorCode;

  constructor(status: number, message: string, code?: ApiErrorCode) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
