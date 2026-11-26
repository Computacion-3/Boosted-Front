import type { EventViewModel } from "../viewmodels/event.viewmodel";
import { EventCard } from "./EventCard";

export type EventListProps = {
  events: EventViewModel[];
  isLoading: boolean;
};

export function EventList({ events, isLoading }: EventListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" aria-label="Cargando eventos" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-box bg-base-100 p-8 text-center text-base-content/70">
        No hay eventos que coincidan con los filtros.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
