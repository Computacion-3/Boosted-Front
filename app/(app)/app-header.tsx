"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import { Header, type HeaderProps } from "@/src/shared/components/Header";

/**
 * Header de las secciones de la aplicación con el cierre de sesión conectado.
 * Existe porque el layout de (app) es un Server Component y no puede usar
 * hooks: el layout le pasa los datos y este componente agrega `onLogout`.
 */
export function AppHeader({ user, navItems }: Omit<HeaderProps, "onLogout">) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
    // Vuelve a pedir los Server Components: los layouts leen la cookie (ya borrada)
    // y dejan de mostrar a la persona.
    router.refresh();
  };

  return <Header user={user} navItems={navItems} onLogout={handleLogout} />;
}
