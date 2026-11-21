"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/src/core/permissions";
import { useAuth } from "../hooks/use-auth";

export type CanProps = {
  /** Permiso que hace falta para ver el contenido (usa PERMISSIONS). */
  permission: Permission;
  children: ReactNode;
  /** Lo que se muestra si falta el permiso (por defecto, nada). */
  fallback?: ReactNode;
};

/**
 * Muestra `children` solo si la persona con sesión tiene el permiso:
 *
 *   <Can permission={PERMISSIONS.USERS_UPDATE_ROLE}>
 *     <Button onClick={changeRole}>Cambiar rol</Button>
 *   </Can>
 *
 * Ocultar un botón NO protege: la Server Action y el backend vuelven a revisar el permiso.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth();
  return <>{hasPermission(permission) ? children : fallback}</>;
}
