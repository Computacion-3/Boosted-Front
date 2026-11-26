import Link from "next/link";

/** Se muestra cuando una ruta no existe o cuando una página llama a notFound(). */
export default function NotFound() {
  return (
    <main className="hero flex-1">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="pt-2 text-3xl font-bold">Página no encontrada</h1>
          <p className="py-4">La página que buscas no existe o fue movida.</p>
          <Link href="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
