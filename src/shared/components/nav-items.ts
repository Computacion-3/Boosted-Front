import { PERMISSIONS, type Permission } from "@/src/core/permissions";

/**
 * Enlaces de la navegación principal. Un enlace con `permission` solo se
 * muestra a quien tenga ese permiso (`recurso:acción`, igual que en el JWT).
 *
 * Ojo: ocultar un enlace NO protege la ruta. La página igual debe llamar a
 * requirePermission() en el servidor.
 */
export type NavItem = {
  href: string;
  label: string;
  permission?: Permission;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/garage", label: "Garaje" },
  { href: "/posts", label: "Comunidad" },
  { href: "/events", label: "Eventos" },
  { href: "/admin/users", label: "Usuarios", permission: PERMISSIONS.USERS_READ },
];

/** Deja solo los enlaces públicos y los que el usuario tiene permiso de ver. */
export function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
  return items.filter((item) => !item.permission || permissions.includes(item.permission));
}
