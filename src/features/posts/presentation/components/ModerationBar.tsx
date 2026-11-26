"use client";

import { useId, useState } from "react";
import { Button, Modal } from "@/src/core/components/ui";

export type ModerationBarProps = {
  postTitle: string;
  isHidden: boolean;
  isSubmitting: boolean;
  onHide: () => Promise<void>;
  onRestore: () => Promise<void>;
};

/**
 * Acciones de moderación de una publicación. Quien la muestra decide si corresponde
 * (solo con el permiso `posts:moderate`). Ocultar pide confirmación porque la publicación
 * desaparece del feed para todos; restaurar es seguro y no la pide.
 */
export function ModerationBar({
  postTitle,
  isHidden,
  isSubmitting,
  onHide,
  onRestore,
}: ModerationBarProps) {
  const headingId = useId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClick = () => {
    if (isSubmitting) return;
    if (isHidden) void onRestore();
    else setIsConfirmOpen(true);
  };

  const handleConfirmHide = async () => {
    await onHide();
    setIsConfirmOpen(false); // si falló, el aviso de error lo emite el store
  };

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-4"
    >
      <div className="min-w-0 flex-1 basis-64">
        <h2 id={headingId} className="text-sm font-semibold">
          Moderación
        </h2>
        <p className="mt-1 text-sm text-base-content/70">
          {isHidden
            ? "Esta publicación no aparece en el feed. Al restaurarla vuelve a mostrarse."
            : "Si la ocultas, deja de aparecer en el feed. Podrás restaurarla desde esta página."}
        </p>
      </div>

      {/*
        Un solo botón que cambia de texto: así el foco vuelve a él al cerrar el modal. Mientras
        hay una petición usa aria-disabled y no disabled, porque un botón disabled pierde el foco.
      */}
      <Button
        variant="outline"
        size="sm"
        className={isSubmitting ? "touch-manipulation btn-disabled" : "touch-manipulation"}
        aria-disabled={isSubmitting || undefined}
        aria-busy={isSubmitting || undefined}
        onClick={handleClick}
      >
        {isHidden ? "Restaurar publicación" : "Ocultar publicación"}
      </Button>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="¿Ocultar la publicación?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmHide} isLoading={isSubmitting}>
              Ocultar publicación
            </Button>
          </>
        }
      >
        <p className="break-words">
          Vas a ocultar <strong>{postTitle}</strong>. Dejará de aparecer en el feed; solo su autor y
          los moderadores podrán abrirla, y puedes restaurarla desde su página.
        </p>
      </Modal>
    </section>
  );
}
