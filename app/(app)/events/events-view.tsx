"use client";

import { ErrorBanner, Pagination } from "@/src/core/components/ui";
import { EventFiltersBar } from "@/src/features/events/presentation/components/EventFiltersBar";
import { EventList } from "@/src/features/events/presentation/components/EventList";
import { EventResultsSummary } from "@/src/features/events/presentation/components/EventResultsSummary";
import { useEvents } from "@/src/features/events/presentation/hooks/use-events";

export function EventsView() {
  const { events, total, page, limit, filters, isLoading, errorMessage, applyFilters, goToPage, reload } =
    useEvents();

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Eventos</h1>
        <p className="text-base-content/70">Meets, exposiciones y rodadas de la comunidad.</p>
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
    </section>
  );
}
