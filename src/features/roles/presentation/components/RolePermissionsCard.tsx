"use client";

import { useState } from "react";
import { Alert, Button, Card } from "@/src/core/components/ui";
import type { PermissionViewModel, RoleViewModel } from "../viewmodels/role.viewmodel";

export type RolePermissionsCardProps = {
  role: RoleViewModel;
  /** Todos los permisos que existen, con su descripción. */
  allPermissions: PermissionViewModel[];
  /** Si quien mira tiene `roles:update`. Sin él, la tarjeta es solo de lectura (auditoría). */
  canEdit: boolean;
  isSaving: boolean;
  /** Error al guardar este rol (por ejemplo, quitarle `roles:update` al administrador). */
  errorMessage: string | null;
  /** true justo después de guardar este rol. */
  justSaved: boolean;
  onSave: (permissions: string[]) => void;
  onDismissFeedback: () => void;
};

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((item) => b.includes(item));

/** Un rol con la lista de permisos marcados. Editarla reemplaza la lista completa al guardar. */
export function RolePermissionsCard({
  role,
  allPermissions,
  canEdit,
  isSaving,
  errorMessage,
  justSaved,
  onSave,
  onDismissFeedback,
}: RolePermissionsCardProps) {
  // Borrador local: los cambios no se envían hasta «Guardar».
  const [draft, setDraft] = useState<string[]>(role.permissions);
  const [lastSaved, setLastSaved] = useState(role.permissions);

  // Si el rol cambió en Redux (al guardar), el borrador se pone al día.
  if (!sameSet(lastSaved, role.permissions)) {
    setLastSaved(role.permissions);
    setDraft(role.permissions);
  }

  const hasChanges = !sameSet(draft, role.permissions);

  const toggle = (name: string) => {
    onDismissFeedback();
    setDraft((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  };

  return (
    <Card title={role.roleLabel}>
      <p className="text-sm text-base-content/60">
        {role.permissions.length === 0 ? "Sin permisos" : `${role.permissions.length} permiso(s)`}
      </p>

      {errorMessage && (
        <Alert variant="error" onDismiss={onDismissFeedback}>
          {errorMessage}
        </Alert>
      )}
      {justSaved && !hasChanges && <Alert variant="success">Cambios guardados.</Alert>}

      <ul className="flex flex-col gap-2">
        {allPermissions.map((permission) => (
          <li key={permission.name}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-sm mt-0.5"
                checked={draft.includes(permission.name)}
                disabled={!canEdit || isSaving}
                onChange={() => toggle(permission.name)}
              />
              <span>
                <code className="text-sm font-semibold">{permission.name}</code>
                {permission.description && (
                  <span className="block text-sm text-base-content/70">{permission.description}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {canEdit && (
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" disabled={!hasChanges || isSaving} onClick={() => setDraft(role.permissions)}>
            Descartar
          </Button>
          <Button size="sm" isLoading={isSaving} disabled={!hasChanges} onClick={() => onSave(draft)}>
            Guardar
          </Button>
        </div>
      )}
    </Card>
  );
}
