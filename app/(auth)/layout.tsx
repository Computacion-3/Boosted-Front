import Link from "next/link";

/**
 * Layout de /login y /register: sin navegación, con el formulario centrado.
 * El grupo (auth) no aparece en la URL.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="text-3xl font-bold">
        Boosted
      </Link>
      <div className="card w-full max-w-md bg-base-100 shadow-md">
        <div className="card-body">{children}</div>
      </div>
    </main>
  );
}
