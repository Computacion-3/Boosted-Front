"use client";

import { Button, Modal } from "@/src/core/components/ui";

export type DeletePostModalProps = {
  isOpen: boolean;
  postTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Confirmación antes de eliminar una publicación: la acción no se puede deshacer. */
export function DeletePostModal({
  isOpen,
  postTitle,
  isDeleting,
  onConfirm,
  onClose,
}: DeletePostModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Eliminar la publicación?"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="error" onClick={onConfirm} isLoading={isDeleting}>
            Eliminar publicación
          </Button>
        </>
      }
    >
      <p className="break-words">
        Vas a eliminar <strong>{postTitle}</strong>. También se eliminarán sus comentarios y esta
        acción no se puede deshacer.
      </p>
    </Modal>
  );
}
