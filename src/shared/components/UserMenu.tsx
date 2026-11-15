"use client";

import Link from "next/link";
import { useState } from "react";

export type HeaderUser = {
  name: string;
  email: string;
};

export type UserMenuProps = {
  user: HeaderUser;
  /** Cierre de sesión. Lo conecta el issue #10 (useAuth().logout); sin él, no se muestra la opción. */
  onLogout?: () => void;
};

/** Iniciales para el avatar: "Juan Romero" -> "JR". Sin nombre, la primera letra del correo. */
export function getInitials(name: string, email: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return email.charAt(0).toUpperCase() || "?";

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <button
        type="button"
        className="btn btn-circle btn-neutral"
        aria-label={`Menú de ${user.name || user.email}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        {getInitials(user.name, user.email)}
      </button>

      {isOpen && (
        <ul
          id="user-menu"
          role="menu"
          className="menu absolute right-0 z-20 mt-2 w-56 rounded-box bg-base-100 p-2 shadow"
        >
          <li className="menu-title" role="presentation">
            <span className="truncate">{user.name || user.email}</span>
          </li>
          <li role="none">
            <Link href="/profile" role="menuitem" onClick={close}>
              Mi perfil
            </Link>
          </li>
          {onLogout && (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onLogout();
                }}
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
