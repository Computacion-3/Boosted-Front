"use client";

import { Alert, Button, Modal } from "@/src/core/components/ui";

export type DeleteEventModalProps = {
  isOpen: boolean;
  eventName: string;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

/** Confirmación antes de eliminar: la acción no se puede deshacer. */
export function DeleteEventModal({
  isOpen,
  eventName,
  isDeleting,
  errorMessage,
  onConfirm,
  onClose,
}: DeleteEventModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Eliminar este evento?"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="error" onClick={onConfirm} isLoading={isDeleting}>
            Eliminar
          </Button>
        </>
      }
    >
      <p>
        Vas a eliminar <strong>{eventName}</strong>. Esta acción no se puede deshacer.
      </p>
      {errorMessage && (
        <Alert variant="error" className="mt-4">
          {errorMessage}
        </Alert>
      )}
    </Modal>
  );
}
