"use client"; // Los error boundaries tienen que ser Client Components.

import "./globals.css";

/**
 * Último recurso: atrapa los errores del layout raíz. Reemplaza al layout,
 * así que define su propio <html> y <body> e importa los estilos globales.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="es" data-theme="light">
      <body className="flex min-h-screen items-center justify-center bg-base-200">
        <title>Error | Boosted</title>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Algo salió mal</h1>
          <p className="py-4">La aplicación tuvo un error inesperado.</p>
          <button type="button" className="btn btn-primary" onClick={() => retry()}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
