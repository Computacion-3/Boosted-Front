"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavLinkProps = {
  href: string;
  children: ReactNode;
  /** Se llama al hacer clic; el menú móvil lo usa para cerrarse. */
  onNavigate?: () => void;
};

/** Activo si la ruta actual es el enlace o una subruta suya (/events/123 activa /events). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, children, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? "menu-active" : undefined}
    >
      {children}
    </Link>
  );
}
