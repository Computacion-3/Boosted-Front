"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventForm } from "@/src/features/events/presentation/components/EventForm";
import { useEventMutations } from "@/src/features/events/presentation/hooks/use-events";

export function NewEventView() {
  const router = useRouter();
  const { createEvent, isSaving, errorMessage, clearError } = useEventMutations();

  // Que no aparezca el error de un intento anterior.
  useEffect(() => clearError(), [clearError]);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/events" className="link link-hover text-sm">
        ← Volver a eventos
      </Link>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold">Crear evento</h1>
          <EventForm
            submitLabel="Publicar evento"
            isSaving={isSaving}
            errorMessage={errorMessage}
            onCancel={() => router.push("/events")}
            onSubmit={async (values) => {
              const created = await createEvent(values);
              if (created) router.push(`/events/${created.id}?aviso=creado`);
            }}
          />
        </div>
      </div>
    </section>
  );
}
