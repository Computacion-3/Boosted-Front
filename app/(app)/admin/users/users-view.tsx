"use client";

import Link from "next/link";
import { Alert, ErrorBanner, Pagination } from "@/src/core/components/ui";
import { PERMISSIONS } from "@/src/core/permissions";
import { Can } from "@/src/features/auth/presentation/components/Can";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import { UsersSearchBar } from "@/src/features/users/presentation/components/UsersSearchBar";
import { UsersTable } from "@/src/features/users/presentation/components/UsersTable";
import { useUsers } from "@/src/features/users/presentation/hooks/use-users";

export function UsersView() {
  const { hasPermission } = useAuth();
  const {
    users,
    total,
    page,
    limit,
    search,
    isLoading,
    errorMessage,
    savingId,
    saveError,
    onSearch,
    goToPage,
    reload,
    changeRole,
    changeStatus,
    clearSaveError,
  } = useUsers();

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Usuarios</h1>
          <p className="text-base-content/70">Cuentas registradas, su rol y su estado.</p>
        </div>
        <Can permission={PERMISSIONS.ROLES_READ}>
          <Link href="/admin/roles" className="btn btn-outline btn-sm">
            Ver roles y permisos
          </Link>
        </Can>
      </header>

      <UsersSearchBar value={search} onSearch={onSearch} />

      {saveError && (
        <Alert variant="error" onDismiss={clearSaveError}>
          {saveError}
        </Alert>
      )}

      {errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : (
        <>
          <UsersTable
            users={users}
            isLoading={isLoading}
            savingId={savingId}
            canChangeRole={hasPermission(PERMISSIONS.USERS_UPDATE_ROLE)}
            canChangeStatus={hasPermission(PERMISSIONS.USERS_UPDATE_STATUS)}
            onChangeRole={changeRole}
            onChangeStatus={changeStatus}
          />
          <Pagination page={page} total={total} limit={limit} onChange={goToPage} />
        </>
      )}
    </section>
  );
}
