import { Alert } from "./Alert";

export type ErrorBannerProps = {
  message: string;
  title?: string;
  /** Si se pasa, aparece el botón "Reintentar". */
  onRetry?: () => void;
  className?: string;
};

/** Banner para cuando falla la carga de una sección (por ejemplo, el listado de eventos). */
export function ErrorBanner({
  message,
  title = "Algo salió mal",
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <Alert
      variant="error"
      title={title}
      className={className}
      action={
        onRetry && (
          <button type="button" className="btn btn-sm" onClick={onRetry}>
            Reintentar
          </button>
        )
      }
    >
      {message}
    </Alert>
  );
}
