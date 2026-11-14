import { getSession } from "@/src/lib/dal";
import { Header } from "@/src/shared/components/Header";
import { filterNavItems, NAV_ITEMS } from "@/src/shared/components/nav-items";

/**
 * Layout de las secciones de la aplicación (garaje, comunidad, eventos, perfil…):
 * Header con la navegación y el menú de usuario, y el contenido debajo.
 *
 * Es un Server Component: lee la sesión de la cookie con el DAL y le pasa al
 * Header solo datos planos (nunca el token). Proteger cada página sigue siendo
 * trabajo de la página (requireSession / requirePermission).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const user = session ? { name: session.name, email: session.email } : null;
  const navItems = filterNavItems(NAV_ITEMS, session?.permissions ?? []);

  return (
    <>
      <Header user={user} navItems={navItems} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 lg:py-8">{children}</main>
    </>
  );
}
