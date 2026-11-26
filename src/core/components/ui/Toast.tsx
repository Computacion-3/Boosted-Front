import { Alert, type AlertVariant } from "./Alert";

export type ToastMessage = {
  id: number;
  message: string;
  variant: AlertVariant;
};

export type ToastContainerProps = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

/**
 * Pinta las notificaciones flotantes en la esquina inferior derecha.
 * Solo recibe props: la lista y cuándo se borran las maneja el hook useToast.
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-50" aria-live="polite">
      {toasts.map((toast) => (
        <Alert key={toast.id} variant={toast.variant} onDismiss={() => onDismiss(toast.id)}>
          {toast.message}
        </Alert>
      ))}
    </div>
  );
}
