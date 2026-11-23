import type { EventViewModel } from "./event.viewmodel";

/** Valores del formulario de evento, tal como los escribe la persona (todo texto). */
export interface EventFormValues {
  name: string;
  description: string;
  city: string;
  date: string;
  location: string;
  organizer: string;
  type: string;
}

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export const EMPTY_EVENT_FORM: EventFormValues = {
  name: "",
  description: "",
  city: "",
  date: "",
  location: "",
  organizer: "",
  type: "",
};

/** Para editar: el formulario arranca con los datos actuales del evento. */
export function eventToFormValues(event: EventViewModel): EventFormValues {
  return {
    name: event.name,
    description: event.description ?? "",
    city: event.city,
    date: event.date,
    location: event.location ?? "",
    organizer: event.organizer,
    type: event.type,
  };
}

/**
 * Validación visual del formulario (feedback inmediato, campo por campo).
 * No reemplaza a la del dominio ni a la del backend: las tres se cumplen.
 */
export function validateEventForm(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};
  if (!values.name.trim()) errors.name = "Escribe el nombre del evento";
  if (!values.city.trim()) errors.city = "Escribe la ciudad";
  if (!values.date) errors.date = "Elige la fecha";
  if (!values.organizer.trim()) errors.organizer = "Escribe quién organiza";
  if (!values.type) errors.type = "Elige el tipo de evento";
  return errors;
}
