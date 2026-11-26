"use server";

import {
  actionError,
  actionOk,
  getErrorStatus,
  toActionError,
  type ActionResult,
} from "@/src/core/errors";
import { getSession } from "@/src/lib/dal";
import { createSession, deleteSession } from "@/src/lib/session";
import { authContainer } from "../../di/auth.container";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { registerSchema, type RegisterFormValues } from "../schemas/register.schema";
import {
  AuthUserViewModelMapper,
  type AuthUserViewModel,
} from "../viewmodels/auth-user.viewmodel";

/*
 * Server Actions de autenticación: la frontera entre el navegador y el servidor.
 * El thunk las llama; ellas llaman al contenedor (server-only) y devuelven
 * ViewModels planos. Los errores esperados viajan como { ok: false, message }.
 */

const LOGIN_ERROR_MESSAGES = {
  401: "Credenciales inválidas",
  403: "Tu cuenta está desactivada. Contacta a un administrador.",
};

/**
 * Inicia sesión: valida, pide el token a la API y lo guarda en la cookie httpOnly.
 * Devuelve solo los datos de la persona para Redux, nunca el token.
 */
export async function loginAction(
  values: LoginFormValues,
): Promise<ActionResult<AuthUserViewModel>> {
  // Se vuelve a validar aquí: la acción se puede llamar sin pasar por el formulario.
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0].message, 400);
  }

  try {
    const tokens = await authContainer.login.execute(parsed.data);
    const payload = await createSession(tokens.accessToken);
    return actionOk(AuthUserViewModelMapper.fromTokenPayload(payload));
  } catch (error) {
    return toActionError(error, LOGIN_ERROR_MESSAGES);
  }
}

/**
 * Crea la cuenta. No inicia sesión: si sale bien, la pantalla manda a /login.
 * Errores: 409 si el correo o el usuario ya existen; 400 si la API rechaza los datos.
 */
export async function registerAction(values: RegisterFormValues): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0].message, 400);
  }

  try {
    // confirmPassword es solo del formulario: no viaja al backend.
    const { name, username, email, password, city, country, bio } = parsed.data;
    await authContainer.register.execute({ name, username, email, password, city, country, bio });
    return actionOk(undefined);
  } catch (error) {
    // En el 409 el backend dice cuál dato está repetido («El correo ya está
    // registrado» / «El nombre de usuario ya está en uso»), en español: se muestra tal cual.
    if (getErrorStatus(error) === 409 && error instanceof Error && error.message) {
      return actionError(error.message, 409);
    }
    return toActionError(error);
  }
}

/**
 * Cierra sesión: primero le pide al backend que revoque el token (así deja de
 * servir aunque alguien lo haya copiado) y después borra la cookie.
 *
 * Si el backend falla (caído, o el token ya estaba revocado), la cookie se borra
 * igual: cerrar sesión en este navegador nunca debe quedar a medias.
 */
export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session) {
    try {
      await authContainer.logout.execute();
    } catch {
      // Se ignora a propósito: lo importante para la persona es salir.
    }
  }

  await deleteSession();
}
