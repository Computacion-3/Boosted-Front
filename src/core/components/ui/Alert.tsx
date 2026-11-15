import type { ReactNode } from "react";
import { classNames } from "./class-names";

export type AlertVariant = "info" | "success" | "warning" | "error";

export type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  /** Si se pasa, muestra un botón para descartar el aviso. */
  onDismiss?: () => void;
  /** Botón u otra acción a la derecha del mensaje (por ejemplo "Reintentar"). */
  action?: ReactNode;
  className?: string;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

/**
 * Aviso en línea. Errores y advertencias usan role="alert" (el lector de pantalla
 * los lee de inmediato); información y éxito usan role="status" (sin interrumpir).
 */
export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  action,
  className,
}: AlertProps) {
  const isUrgent = variant === "error" || variant === "warning";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      className={classNames("alert", variantClasses[variant], className)}
    >
      <div>
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="text-sm">{children}</div>}
      </div>
      {(action || onDismiss) && (
        <div className="flex gap-2">
          {action}
          {onDismiss && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onDismiss}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
