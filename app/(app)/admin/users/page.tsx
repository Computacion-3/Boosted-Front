import type { Metadata } from "next";
import { AccessDenied } from "@/src/core/components/ui";
import { PERMISSIONS } from "@/src/core/permissions";
import { checkPermission } from "@/src/lib/dal";
import { UsersView } from "./users-view";

export const metadata: Metadata = { title: "Usuarios | Boosted" };

/** /admin/users. Exige `users:read`: sin él muestra el aviso 403 en vez de romperse. */
export default async function AdminUsersPage() {
  if (!(await checkPermission(PERMISSIONS.USERS_READ))) {
    return <AccessDenied message="Esta sección es solo para administradores." />;
  }
  return <UsersView />;
}
