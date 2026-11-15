import { DomainError } from "./domain-error";
import {
  getHttpErrorMessage,
  UNEXPECTED_ERROR_MESSAGE,
  type HttpErrorMessageOverrides,
} from "./http-error-messages";

/**
 * Convención de las Server Actions para los errores ESPERADOS
 * (validación, 401, 403, 404, 409): se devuelven como valor, no se lanzan.
 *
 *   return actionOk(eventViewModel);            // { ok: true, data }
 *   return toActionError(error);                // { ok: false, message, status }
 *
 * El thunk revisa `ok` y, si es false, hace `rejectWithValue(result.message)`.
 */
export type ActionSuccess<T> = { ok: true; data: T };
export type ActionFailure = { ok: false; message: string; status?: number };
export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export function actionOk<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function actionError(message: string, status?: number): ActionFailure {
  return { ok: false, message, status };
}

/** Lee el status HTTP de un error si lo trae (por ejemplo, el ApiError del cliente HTTP). */
export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status } = error as { status: unknown };
    if (typeof status === "number") return status;
  }
  return undefined;
}

/**
 * Convierte cualquier error en un mensaje en español para la persona:
 * - DomainError: su propio mensaje (ya está pensado para mostrarse).
 * - Error con status HTTP: el mensaje de getHttpErrorMessage.
 * - Cualquier otra cosa: un mensaje genérico (nunca detalles internos).
 */
export function getErrorMessage(
  error: unknown,
  overrides: HttpErrorMessageOverrides = {},
): string {
  if (error instanceof DomainError) return error.message;

  const status = getErrorStatus(error);
  if (status !== undefined) return getHttpErrorMessage(status, overrides);

  return UNEXPECTED_ERROR_MESSAGE;
}

export function toActionError(
  error: unknown,
  overrides: HttpErrorMessageOverrides = {},
): ActionFailure {
  return actionError(getErrorMessage(error, overrides), getErrorStatus(error));
}
