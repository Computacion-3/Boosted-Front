import Link from "next/link";
import { HOME_ROUTE } from "@/src/lib/routes";

export type AccessDeniedProps = {
  /** Explicación corta de qué se intentó abrir. */
  message?: string;
  /** A dónde lleva el botón para volver (por defecto, la home privada, que sí tiene el Header). */
  backHref?: string;
};

/**
 * Aviso de «sin permiso» (403) para las páginas que exigen un permiso. Lo
 * muestra la página de servidor cuando checkPermission() devuelve false, en vez
 * de dejar que la ruta se rompa con un error genérico.
 */
export function AccessDenied({
  message = "Tu cuenta no tiene permiso para ver esta sección.",
  backHref = HOME_ROUTE,
}: AccessDeniedProps) {
  return (
    <section className="hero py-10" role="alert">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-sm font-semibold text-error">Error 403</p>
          <h1 className="text-3xl font-bold">No tienes acceso</h1>
          <p className="py-4">{message}</p>
          <p className="pb-6 text-sm text-base-content/70">
            Si crees que es un error, pídele a un administrador que revise tus permisos.
          </p>
          <Link href={backHref} className="btn btn-primary">
            Volver
          </Link>
        </div>
      </div>
    </section>
  );
}
