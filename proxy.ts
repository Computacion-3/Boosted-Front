import { NextRequest, NextResponse } from "next/server";
import { decodeToken, SESSION_COOKIE } from "@/src/lib/token";

/**
 * Primera puerta de la sesión (en Next 16 reemplaza a middleware.ts).
 * Solo revisa si HAY sesión, no permisos: eso lo hacen el DAL en cada página y
 * cada Server Action. Tampoco verifica la firma del token: eso lo hace el backend.
 *
 * Todo está protegido por defecto: una ruta nueva nace privada sin tocar este
 * archivo. Para hacer pública una ruta hay que agregarla aquí.
 */

// Rutas que cualquiera puede ver, con o sin sesión.
const publicRoutes = ["/"];

// Rutas solo para quien NO tiene sesión: si ya inició sesión, se le saca de aquí.
const authRoutes = ["/login", "/register"];

// A dónde va quien ya tiene sesión e intenta entrar a /login o /register.
const HOME_ROUTE = "/";

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = publicRoutes.includes(path);
  const isAuthRoute = authRoutes.includes(path);

  const payload = decodeToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL(HOME_ROUTE, req.nextUrl));
  }

  if (!isPublic && !isAuthRoute && !payload) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // No corre en: rutas /api, archivos internos de Next (_next/static, _next/image)
  // ni archivos con extensión (favicon.ico, imágenes de public/, robots.txt...).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
