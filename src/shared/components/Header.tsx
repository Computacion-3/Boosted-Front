"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { NavItem } from "./nav-items";
import { Navbar } from "./Navbar";
import { UserMenu, type HeaderUser } from "./UserMenu";

export type HeaderProps = {
  /** null si no hay sesión: se muestra el botón "Iniciar sesión". */
  user: HeaderUser | null;
  /** Enlaces ya filtrados por permiso (ver filterNavItems). */
  navItems: NavItem[];
  onLogout?: () => void;
  /** Se muestra junto al menú de usuario, solo cuando hay sesión. El Header no sabe qué es. */
  notificationsSlot?: ReactNode;
};

/**
 * Barra superior. Mobile-first: en pantallas pequeñas los enlaces van en un menú
 * desplegable (botón hamburguesa); desde `lg` se muestran en línea.
 */
export function Header({ user, navItems, onLogout, notificationsSlot }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 bg-base-100 shadow-sm">
      <div className="navbar mx-auto max-w-6xl px-2 md:px-4">
        <div className="navbar-start gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-square lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="btn btn-ghost text-xl font-bold">
            Boosted
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <Navbar items={navItems} />
        </div>

        <div className="navbar-end">
          {user ? (
            <div className="flex items-center gap-1">
              {notificationsSlot}
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-base-300 px-2 pb-2 lg:hidden">
          <Navbar items={navItems} orientation="vertical" onNavigate={closeMenu} />
        </div>
      )}
    </header>
  );
}
