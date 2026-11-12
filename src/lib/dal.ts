import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeToken, SESSION_COOKIE } from "./token";

/**
 * DAL (Data Access Layer): la segunda puerta de la sesión, después de proxy.ts.
 * Cada página protegida y cada Server Action la llaman en su primera línea.
 */

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  accessToken: string; // para mandarlo al backend como Authorization: Bearer
};

/** Lee la cookie y devuelve la sesión, o null si no hay o el token venció. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = decodeToken(token);

  if (!payload || !token) {
    return null;
  }

  return {
    userId: payload.sub,
    // Valores por defecto para tokens viejos que no traen estos campos.
    name: payload.name ?? "",
    email: payload.email ?? "",
    role: payload.role,
    permissions: payload.permissions ?? [],
    accessToken: token,
  };
}

/**
 * Exige sesión: si no hay, redirige a /login.
 * Ojo: redirect() funciona lanzando una excepción, así que en una Server Action
 * se llama FUERA del try/catch para que el catch no se la trague.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Exige sesión y un permiso (`recurso:acción`, por ejemplo `posts:moderate`).
 * Sin sesión redirige a /login; sin el permiso lanza un error.
 */
export async function requirePermission(permission: string): Promise<Session> {
  const session = await requireSession();

  if (!session.permissions.includes(permission)) {
    throw new Error("No tienes permiso para realizar esta acción");
  }

  return session;
}
