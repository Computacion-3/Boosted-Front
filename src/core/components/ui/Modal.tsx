"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export type ModalProps = {
  isOpen: boolean;
  /** Se llama al cerrar con Esc, con el fondo o con el botón de cerrar. */
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Botones del pie, por ejemplo "Cancelar" y "Eliminar". */
  actions?: ReactNode;
};

/**
 * Modal accesible sobre el <dialog> nativo del navegador.
 * showModal() deja inerte el resto de la página (el foco queda atrapado dentro),
 * mueve el foco al primer control del modal y cierra con Esc. Al cerrar, el
 * navegador devuelve el foco al elemento que lo abrió.
 */
export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // El estado de React (isOpen) manda; el <dialog> solo lo refleja.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} onClose={onClose}>
      <div className="modal-box">
        <form method="dialog">
          <button
            type="submit"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </form>
        <h3 id={titleId} className="text-lg font-bold">
          {title}
        </h3>
        <div className="py-4">{children}</div>
        {actions && <div className="modal-action">{actions}</div>}
      </div>
      {/* Clic fuera de la caja: cierra el modal. */}
      <form method="dialog" className="modal-backdrop">
        <button type="submit" tabIndex={-1}>
          Cerrar
        </button>
      </form>
    </dialog>
  );
}
