"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ErrorBanner, ToastContainer } from "@/src/core/components/ui";
import { DeleteEventModal } from "@/src/features/events/presentation/components/DeleteEventModal";
import { EventDetail } from "@/src/features/events/presentation/components/EventDetail";
import { useEventNotice } from "@/src/features/events/presentation/hooks/use-event-notice";
import {
  useEventDetail,
  useEventMutations,
} from "@/src/features/events/presentation/hooks/use-events";

export function EventDetailView({ id, notice }: { id: string; notice?: string }) {
  const router = useRouter();
  const { event, isLoading, errorMessage, reload } = useEventDetail(id);
  const { deleteEvent, isSaving, errorMessage: deleteError, clearError } = useEventMutations();
  const { toasts, dismissToast } = useEventNotice(notice);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openDelete = () => {
    clearError();
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (await deleteEvent(id)) router.push("/events?aviso=eliminado");
  };

  return (
    <section className="flex flex-col gap-4">
      <Link href="/events" className="link link-hover text-sm">
        ← Volver a eventos
      </Link>

      {isLoading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" aria-label="Cargando evento" />
        </div>
      )}
      {!isLoading && errorMessage && <ErrorBanner message={errorMessage} onRetry={reload} />}
      {!isLoading && event && (
        <>
          <EventDetail
            event={event}
            // Solo orienta la interfaz: si alguien sin permiso lo intenta, el backend responde 403.
            actions={
              event.canEdit && (
                <>
                  <Link href={`/events/${event.id}/edit`} className="btn btn-outline">
                    Editar
                  </Link>
                  <Button variant="error" onClick={openDelete}>
                    Eliminar
                  </Button>
                </>
              )
            }
          />
          <DeleteEventModal
            isOpen={isDeleteOpen}
            eventName={event.name}
            isDeleting={isSaving}
            errorMessage={deleteError}
            onConfirm={confirmDelete}
            onClose={() => setIsDeleteOpen(false)}
          />
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
