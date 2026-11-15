"use client"; // Los error boundaries tienen que ser Client Components.

import { useEffect } from "react";
import Link from "next/link";

/**
 * Pantalla para los errores INESPERADOS que se escapan al renderizar una ruta.
 * Los esperados (validación, 401, 403, 404, 409) no llegan aquí: las Server
 * Actions los devuelven como { ok: false, message } y la pantalla los muestra.
 *
 * En producción Next oculta el mensaje de los errores del servidor; por eso se
 * muestra un texto genérico y el `digest`, que sirve para buscar el error en los logs.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : undefined;

  return (
    <main className="hero flex-1">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold">Algo salió mal</h1>
          <p className="py-4">
            Ocurrió un error inesperado al cargar esta página. Puedes intentarlo de nuevo.
          </p>
          {digest && <p className="pb-4 text-sm text-base-content/60">Código: {digest}</p>}
          <div className="flex justify-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => retry()}>
              Reintentar
            </button>
            <Link href="/" className="btn btn-ghost">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
