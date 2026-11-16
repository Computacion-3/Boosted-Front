import type {
  CommunityEvent,
  EventType,
  EventViewer,
} from "../../domain/entities/community-event";

/** Evento listo para pintar: datos planos y serializables (van al estado de Redux). */
export interface EventViewModel {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly city: string;
  readonly location: string | null;
  readonly organizer: string;
  readonly type: EventType;
  /** "Meet", "Exposición"… */
  readonly typeLabel: string;
  /** YYYY-MM-DD, para formularios y filtros. */
  readonly date: string;
  /** "15 de octubre de 2026" */
  readonly formattedDate: string;
  readonly isPast: boolean;
  /** Si quien mira puede editarlo o eliminarlo (solo orienta la interfaz; el backend decide). */
  readonly canEdit: boolean;
}

export interface PaginatedEventsViewModel {
  readonly items: EventViewModel[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meet: "Meet",
  exposicion: "Exposición",
  reunion_club: "Reunión de club",
  jornada_mantenimiento: "Jornada de mantenimiento",
  circuito: "Circuito",
  otro: "Otro",
};

/** Opciones para los selects de tipo (filtros y formulario). */
export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  // La fecha no tiene hora: se interpreta en UTC para que no se corra un día.
  timeZone: "UTC",
});

/** "2026-10-15" -> "15 de octubre de 2026" */
export function formatEventDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

export interface EventViewModelContext {
  viewer: EventViewer | null;
  /** Hoy en formato YYYY-MM-DD. */
  today: string;
}

export class EventViewModelMapper {
  static toViewModel(event: CommunityEvent, context: EventViewModelContext): EventViewModel {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      city: event.city,
      location: event.location,
      organizer: event.organizer,
      type: event.type,
      typeLabel: EVENT_TYPE_LABELS[event.type],
      date: event.date,
      formattedDate: formatEventDate(event.date),
      isPast: event.isPast(context.today),
      canEdit: event.canBeModifiedBy(context.viewer),
    };
  }
}
