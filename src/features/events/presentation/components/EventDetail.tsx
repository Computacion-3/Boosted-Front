import type { ReactNode } from "react";
import type { EventViewModel } from "../viewmodels/event.viewmodel";

export type EventDetailProps = {
  event: EventViewModel;
  /** Botones de editar y eliminar, cuando la persona puede hacerlo. */
  actions?: ReactNode;
};

export function EventDetail({ event, actions }: EventDetailProps) {
  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary badge-outline">{event.typeLabel}</span>
          {event.isPast && <span className="badge badge-ghost">Finalizado</span>}
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">{event.name}</h1>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-base-content/60">Fecha</dt>
            <dd className="font-medium">{event.formattedDate}</dd>
          </div>
          <div>
            <dt className="text-sm text-base-content/60">Ciudad</dt>
            <dd className="font-medium">{event.city}</dd>
          </div>
          <div>
            <dt className="text-sm text-base-content/60">Lugar</dt>
            <dd className="font-medium">{event.location ?? "Por definir"}</dd>
          </div>
          <div>
            <dt className="text-sm text-base-content/60">Organiza</dt>
            <dd className="font-medium">{event.organizer}</dd>
          </div>
        </dl>

        {event.description && <p className="whitespace-pre-line">{event.description}</p>}

        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </article>
  );
}
