"use client";

import type { NavItem } from "./nav-items";
import { NavLink } from "./NavLink";

export type NavbarProps = {
  items: NavItem[];
  /** Horizontal en escritorio, vertical dentro del menú móvil. */
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
};

export function Navbar({ items, orientation = "horizontal", onNavigate }: NavbarProps) {
  const menuClass =
    orientation === "horizontal" ? "menu menu-horizontal gap-1 px-1" : "menu w-full gap-1";

  return (
    <nav aria-label="Navegación principal">
      <ul className={menuClass}>
        {items.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} onNavigate={onNavigate}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
