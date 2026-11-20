"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, ErrorBanner } from "@/src/core/components/ui";
import { EventForm } from "@/src/features/events/presentation/components/EventForm";
import {
  useEventDetail,
  useEventMutations,
} from "@/src/features/events/presentation/hooks/use-events";
import { eventToFormValues } from "@/src/features/events/presentation/viewmodels/event-form.viewmodel";

export function EditEventView({ id }: { id: string }) {
  const router = useRouter();
  const { event, isLoading, errorMessage: loadError, reload } = useEventDetail(id);
  const { updateEvent, isSaving, errorMessage, clearError } = useEventMutations();

  useEffect(() => clearError(), [clearError]);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href={`/events/${id}`} className="link link-hover text-sm">
        ← Volver al evento
      </Link>

      {isLoading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" aria-label="Cargando evento" />
        </div>
      )}
      {!isLoading && loadError && <ErrorBanner message={loadError} onRetry={reload} />}

      {!isLoading && event && !event.canEdit && (
        <Alert variant="warning" title="No puedes editar este evento">
          Solo quien lo creó, un moderador o un administrador pueden modificarlo.
        </Alert>
      )}

      {!isLoading && event?.canEdit && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h1 className="text-2xl font-bold">Editar evento</h1>
            <EventForm
              key={event.id}
              initialValues={eventToFormValues(event)}
              submitLabel="Guardar cambios"
              isSaving={isSaving}
              errorMessage={errorMessage}
              onCancel={() => router.push(`/events/${id}`)}
              onSubmit={async (values) => {
                if (await updateEvent(id, values)) router.push(`/events/${id}?aviso=actualizado`);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
