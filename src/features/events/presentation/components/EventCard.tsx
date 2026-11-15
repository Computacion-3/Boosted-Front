import Link from "next/link";
import type { EventViewModel } from "../viewmodels/event.viewmodel";

export type EventCardProps = {
  event: EventViewModel;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="card h-full bg-base-100 shadow-sm">
      <div className="card-body gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary badge-outline">{event.typeLabel}</span>
          {event.isPast && <span className="badge badge-ghost">Finalizado</span>}
        </div>
        <h2 className="card-title">
          <Link href={`/events/${event.id}`} className="link-hover">
            {event.name}
          </Link>
        </h2>
        <p className="text-sm font-medium">{event.formattedDate}</p>
        <p className="text-sm text-base-content/70">
          {event.city}
          {event.location && ` · ${event.location}`}
        </p>
        <p className="text-sm text-base-content/70">Organiza: {event.organizer}</p>
        <div className="card-actions mt-auto justify-end">
          <Link href={`/events/${event.id}`} className="btn btn-sm btn-ghost">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
