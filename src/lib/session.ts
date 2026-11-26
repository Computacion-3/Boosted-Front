import "server-only";
import { cookies } from "next/headers";
import { decodeToken, SESSION_COOKIE, type TokenPayload } from "./token";

/**
 * Guarda el JWT del backend en una cookie httpOnly. Solo se puede llamar desde
 * una Server Action o un Route Handler: Next no deja escribir cookies mientras
 * renderiza una página.
 */
export async function createSession(token: string): Promise<TokenPayload> {
  const payload = decodeToken(token);

  if (!payload) {
    throw new Error("El backend entregó un token inválido");
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript del navegador no puede leer la cookie (protege contra XSS)
    secure: process.env.NODE_ENV === "production", // Solo viaja por HTTPS en producción; en desarrollo se permite http://localhost
    sameSite: "lax", // No se envía en peticiones entre sitios, salvo al navegar con un enlace (protege contra CSRF)
    expires: new Date(payload.exp * 1000), // La cookie vence cuando vence el token (exp viene en segundos)
    path: "/", // La cookie se envía en todas las rutas de la aplicación
  });

  return payload;
}

/** Borra la cookie de sesión. Igual que createSession, solo en Server Actions o Route Handlers. */
export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
