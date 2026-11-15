import { DomainError } from "@/src/core/errors/domain-error";

/** Tipos de evento que acepta la API. */
export const EVENT_TYPES = [
  "meet",
  "exposicion",
  "reunion_club",
  "jornada_mantenimiento",
  "circuito",
  "otro",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/** Roles que pueden editar o eliminar eventos de otras personas (igual que en el backend). */
const EVENT_MODERATOR_ROLES = ["moderador", "administrador"];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

/** true si la fecha tiene formato YYYY-MM-DD y existe en el calendario (rechaza 2026-02-30). */
export function isValidEventDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Campos de un evento que escribe la persona (los mismos para crear y para editar). */
export interface EventFields {
  name: string;
  description: string | null;
  city: string;
  date: string;
  location: string | null;
  organizer: string;
  type: EventType;
}

/**
 * Reglas de negocio de los campos de un evento. Revisa solo los campos presentes,
 * así sirve para crear (todos) y para editar (algunos). Lanza DomainError en español.
 */
export function validateEventFields(fields: Partial<EventFields>): void {
  if (fields.name !== undefined && fields.name.trim() === "") {
    throw new DomainError("El nombre del evento es obligatorio");
  }
  if (fields.city !== undefined && fields.city.trim() === "") {
    throw new DomainError("La ciudad del evento es obligatoria");
  }
  if (fields.organizer !== undefined && fields.organizer.trim() === "") {
    throw new DomainError("El organizador del evento es obligatorio");
  }
  if (fields.date !== undefined && !isValidEventDate(fields.date)) {
    throw new DomainError("La fecha del evento debe tener el formato AAAA-MM-DD");
  }
  if (fields.type !== undefined && !isEventType(fields.type)) {
    throw new DomainError("El tipo de evento no es válido");
  }
}

export interface CommunityEventProps extends EventFields {
  id: string;
  /** Puede ser null en eventos creados antes de que el backend guardara el creador. */
  createdById: string | null;
  createdAt: Date;
}

/** Quién está mirando el evento: lo necesario para decidir si puede modificarlo. */
export interface EventViewer {
  id: string;
  role: string;
}

/**
 * Un evento de la comunidad (meet, exposición, circuito…).
 * Se llama CommunityEvent y no Event para no confundirlo con el Event del navegador.
 */
export class CommunityEvent {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly city: string;
  /** Fecha del evento en formato YYYY-MM-DD (sin hora ni zona horaria). */
  readonly date: string;
  readonly location: string | null;
  readonly organizer: string;
  readonly type: EventType;
  readonly createdById: string | null;
  readonly createdAt: Date;

  constructor(props: CommunityEventProps) {
    if (props.id.trim() === "") {
      throw new DomainError("El evento no tiene id");
    }
    validateEventFields(props);

    this.id = props.id;
    this.name = props.name.trim();
    this.description = props.description?.trim() || null;
    this.city = props.city.trim();
    this.date = props.date;
    this.location = props.location?.trim() || null;
    this.organizer = props.organizer.trim();
    this.type = props.type;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
  }

  /** true si el evento ya pasó. `today` va en formato YYYY-MM-DD; las fechas se comparan como texto. */
  isPast(today: string): boolean {
    return this.date < today;
  }

  /** Regla del backend: lo modifica quien lo creó, un moderador o un administrador. */
  canBeModifiedBy(viewer: EventViewer | null): boolean {
    if (!viewer) return false;
    return viewer.id === this.createdById || EVENT_MODERATOR_ROLES.includes(viewer.role);
  }
}
