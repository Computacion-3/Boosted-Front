"use client";

import Link from "next/link";
import { ErrorBanner } from "@/src/core/components/ui";
import { EventDetail } from "@/src/features/events/presentation/components/EventDetail";
import { useEventDetail } from "@/src/features/events/presentation/hooks/use-events";

export function EventDetailView({ id }: { id: string }) {
  const { event, isLoading, errorMessage, reload } = useEventDetail(id);

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
      {!isLoading && event && <EventDetail event={event} />}
    </section>
  );
}
