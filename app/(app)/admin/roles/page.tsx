import type { Metadata } from "next";
import { AccessDenied } from "@/src/core/components/ui";
import { PERMISSIONS } from "@/src/core/permissions";
import { checkPermission } from "@/src/lib/dal";
import { RolesView } from "./roles-view";

export const metadata: Metadata = { title: "Roles y permisos | Boosted" };

/** /admin/roles. Exige `roles:read`: sin él muestra el aviso 403 en vez de romperse. */
export default async function AdminRolesPage() {
  if (!(await checkPermission(PERMISSIONS.ROLES_READ))) {
    return <AccessDenied message="Esta sección es solo para administradores." />;
  }
  return <RolesView />;
}
