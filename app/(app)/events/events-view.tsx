"use client";

import Link from "next/link";
import { ErrorBanner, Pagination, ToastContainer } from "@/src/core/components/ui";
import { EventFiltersBar } from "@/src/features/events/presentation/components/EventFiltersBar";
import { EventList } from "@/src/features/events/presentation/components/EventList";
import { EventResultsSummary } from "@/src/features/events/presentation/components/EventResultsSummary";
import { useEventNotice } from "@/src/features/events/presentation/hooks/use-event-notice";
import { useEvents } from "@/src/features/events/presentation/hooks/use-events";

export function EventsView({ notice }: { notice?: string }) {
  const { events, total, page, limit, filters, isLoading, errorMessage, applyFilters, goToPage, reload } =
    useEvents();
  const { toasts, dismissToast } = useEventNotice(notice);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Eventos</h1>
          <p className="text-base-content/70">Meets, exposiciones y rodadas de la comunidad.</p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          Crear evento
        </Link>
      </header>

      <EventFiltersBar value={filters} onChange={applyFilters} />

      {errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : (
        <>
          <EventResultsSummary page={page} limit={limit} total={total} />
          <EventList events={events} isLoading={isLoading} />
          <Pagination page={page} total={total} limit={limit} onChange={goToPage} />
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
