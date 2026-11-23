"use client";

import { useState } from "react";
import { Button, Modal, Table, type TableColumn } from "@/src/core/components/ui";
import {
  USER_ROLE_OPTIONS,
  type ManagedUserViewModel,
  type UserRole,
  type UserStatus,
} from "../viewmodels/managed-user.viewmodel";

export type UsersTableProps = {
  users: ManagedUserViewModel[];
  isLoading: boolean;
  /** Usuario cuya fila se está guardando. */
  savingId: string | null;
  /** Si quien mira tiene `users:update-role` / `users:update-status` (solo orienta la interfaz). */
  canChangeRole: boolean;
  canChangeStatus: boolean;
  onChangeRole: (id: string, role: UserRole) => void;
  onChangeStatus: (id: string, status: UserStatus) => void;
};

/**
 * Tabla de usuarios. La fila de quien mira sale con los controles deshabilitados:
 * nadie puede cambiar su propio rol o estado (el backend también lo rechaza).
 */
export function UsersTable({
  users,
  isLoading,
  savingId,
  canChangeRole,
  canChangeStatus,
  onChangeRole,
  onChangeStatus,
}: UsersTableProps) {
  // Desactivar una cuenta pide confirmación: la persona ya no podrá iniciar sesión.
  const [toDeactivate, setToDeactivate] = useState<ManagedUserViewModel | null>(null);

  const columns: TableColumn<ManagedUserViewModel>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (user) => (
        <div>
          <p className="font-medium">
            {user.name || "Sin nombre"} {user.isSelf && <span className="badge badge-ghost badge-sm">Tú</span>}
          </p>
          <p className="text-sm text-base-content/60">@{user.username}</p>
        </div>
      ),
    },
    { key: "email", header: "Correo", render: (user) => user.email },
    {
      key: "role",
      header: "Rol",
      render: (user) =>
        canChangeRole ? (
          <select
            className="select select-sm"
            aria-label={`Rol de ${user.name || user.username}`}
            value={user.role}
            disabled={user.isSelf || savingId === user.id}
            title={user.isSelf ? "No puedes cambiar tu propio rol" : undefined}
            onChange={(event) => onChangeRole(user.id, event.target.value as UserRole)}
          >
            {USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="badge badge-outline">{user.roleLabel}</span>
        ),
    },
    {
      key: "status",
      header: "Estado",
      render: (user) => (
        <span className={`badge ${user.isActive ? "badge-success" : "badge-error"}`}>{user.statusLabel}</span>
      ),
    },
  ];

  if (canChangeStatus) {
    columns.push({
      key: "actions",
      header: "Acciones",
      render: (user) => (
        <Button
          size="sm"
          variant={user.isActive ? "outline" : "primary"}
          isLoading={savingId === user.id}
          disabled={user.isSelf}
          title={user.isSelf ? "No puedes cambiar el estado de tu propia cuenta" : undefined}
          onClick={() => (user.isActive ? setToDeactivate(user) : onChangeStatus(user.id, "activo"))}
        >
          {user.isActive ? "Desactivar" : "Activar"}
        </Button>
      ),
    });
  }

  return (
    <>
      <Table
        caption="Usuarios registrados"
        columns={columns}
        rows={users}
        getRowKey={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="No hay usuarios que coincidan con la búsqueda."
      />

      <Modal
        isOpen={toDeactivate !== null}
        onClose={() => setToDeactivate(null)}
        title="¿Desactivar la cuenta?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setToDeactivate(null)}>
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={() => {
                if (toDeactivate) onChangeStatus(toDeactivate.id, "inactivo");
                setToDeactivate(null);
              }}
            >
              Desactivar
            </Button>
          </>
        }
      >
        <p>
          <strong>{toDeactivate?.name || toDeactivate?.username}</strong> no podrá iniciar sesión hasta que
          vuelvas a activar su cuenta. El cambio tiene efecto inmediato.
        </p>
      </Modal>
    </>
  );
}
