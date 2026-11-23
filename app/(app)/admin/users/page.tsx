import type { Metadata } from "next";
import { AccessDenied } from "@/src/core/components/ui";
import { PERMISSIONS } from "@/src/core/permissions";
import { checkPermission } from "@/src/lib/dal";

export const metadata: Metadata = { title: "Usuarios | Boosted" };

/**
 * /admin/users. Exige el permiso `users:read`: sin él muestra el aviso 403 en
 * vez de romperse. El contenido (listado, cambiar rol y estado) llega con el #14.
 */
export default async function AdminUsersPage() {
  if (!(await checkPermission(PERMISSIONS.USERS_READ))) {
    return <AccessDenied message="Esta sección es solo para administradores." />;
  }

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold md:text-3xl">Usuarios</h1>
      <p className="text-base-content/70">
        Aquí vas a poder ver los usuarios y cambiar su rol y su estado (en construcción, #14).
      </p>
    </section>
  );
}
