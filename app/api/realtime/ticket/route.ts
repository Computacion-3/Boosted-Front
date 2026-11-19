import { getSession } from "@/src/lib/dal";

const API_TIMEOUT_MS = 10_000;

/**
 * Cambia la sesión (cookie httpOnly) por un ticket de un solo uso para el
 * WebSocket. El navegador no puede leer la cookie ni mandar el Bearer, así que
 * lo hace este Route Handler en el servidor y devuelve solo `{ ticket }`.
 *
 * El `proxy.ts` no cubre `/api`, así que esta ruta exige la sesión por su cuenta.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "No hay una sesión activa" }, { status: 401 });
  }

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return Response.json(
      { message: "Falta la variable de entorno API_URL" },
      { status: 500 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/auth/socket-ticket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    return Response.json(
      { message: "No se pudo conectar con el servidor" },
      { status: 502 },
    );
  }

  // Token revocado o vencido en el backend: para el navegador es lo mismo que no tener sesión.
  if (response.status === 401) {
    return Response.json({ message: "No hay una sesión activa" }, { status: 401 });
  }

  const body: unknown = response.ok ? await response.json().catch(() => null) : null;
  const ticket =
    typeof body === "object" && body !== null
      ? (body as { ticket?: unknown }).ticket
      : undefined;
  if (typeof ticket !== "string" || ticket === "") {
    return Response.json(
      { message: "El servidor no pudo emitir el ticket" },
      { status: 502 },
    );
  }

  return Response.json({ ticket });
}
