import { jwtDecode } from "jwt-decode";

// Nombre de la cookie httpOnly donde vive el JWT que emite el backend.
export const SESSION_COOKIE = "session";

/**
 * Lo que trae el JWT de Boosted. `name` y `permissions` son opcionales porque
 * los tokens emitidos antes de que el backend los agregara no los traen.
 */
export type TokenPayload = {
  sub: string; // id (UUID) del usuario
  name?: string;
  email?: string;
  role: string;
  permissions?: string[];
  exp: number; // vencimiento en segundos desde 1970 (estándar JWT)
};

/**
 * Decodifica el token SIN verificar la firma: eso lo hace el backend en cada
 * petición. Lo que se lee aquí solo sirve para decidir qué mostrar y a dónde
 * redirigir, nunca para proteger datos.
 *
 * Devuelve null si no hay token, si no se puede leer o si ya venció.
 * Es puro (no usa cookies ni Next), así que lo pueden usar proxy.ts y el servidor.
 */
export function decodeToken(token: string | undefined): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);

    // exp viene en segundos y Date.now() en milisegundos.
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
