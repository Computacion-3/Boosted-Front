"use client";

import { Alert, ErrorBanner } from "@/src/core/components/ui";
import { PERMISSIONS } from "@/src/core/permissions";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import { RolePermissionsCard } from "@/src/features/roles/presentation/components/RolePermissionsCard";
import { useRoles } from "@/src/features/roles/presentation/hooks/use-roles";

export function RolesView() {
  const { hasPermission } = useAuth();
  const { roles, permissions, isLoading, errorMessage, savingRole, saveError, savedRole, reload, savePermissions, clearFeedback } =
    useRoles();
  const canEdit = hasPermission(PERMISSIONS.ROLES_UPDATE);

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Roles y permisos</h1>
        <p className="text-base-content/70">Qué puede hacer cada rol en la plataforma.</p>
      </header>

      {!canEdit && (
        <Alert variant="info">Estás viendo los permisos en modo lectura: tu cuenta no puede editarlos.</Alert>
      )}

      {errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" aria-label="Cargando roles" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <RolePermissionsCard
              key={role.role}
              role={role}
              allPermissions={permissions}
              canEdit={canEdit}
              isSaving={savingRole === role.role}
              errorMessage={saveError?.role === role.role ? saveError.message : null}
              justSaved={savedRole === role.role}
              onSave={(rolePermissions) => savePermissions(role.role, rolePermissions)}
              onDismissFeedback={clearFeedback}
            />
          ))}
        </div>
      )}
    </section>
  );
}
