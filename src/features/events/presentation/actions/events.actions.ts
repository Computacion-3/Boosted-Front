"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { getSession, requireSession } from "@/src/lib/dal";
import { eventsContainer } from "../../di/events.container";
import type { EventType } from "../../domain/entities/community-event";
import type {
  CreateEventParams,
  EventQuery,
  UpdateEventParams,
} from "../../domain/repositories/event.repository";
import type { EventFormValues } from "../viewmodels/event-form.viewmodel";
import {
  EventViewModelMapper,
  type EventViewModel,
  type EventViewModelContext,
  type PaginatedEventsViewModel,
} from "../viewmodels/event.viewmodel";

/*
 * Server Actions de eventos: la frontera entre el navegador y el servidor.
 * El thunk las llama; ellas llaman al contenedor (server-only) y devuelven
 * ViewModels planos. Los errores esperados viajan como { ok: false, message }.
 */

/** Quién mira (para `canEdit`) y la fecha de hoy en Colombia (para `isPast`). */
async function getViewModelContext(): Promise<EventViewModelContext> {
  const session = await getSession();
  // en-CA formatea como YYYY-MM-DD.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  return {
    viewer: session ? { id: session.userId, role: session.role } : null,
    today,
  };
}

const NOT_FOUND_MESSAGE = { 404: "El evento no existe o fue eliminado." };

export async function getEventsAction(
  query: EventQuery,
): Promise<ActionResult<PaginatedEventsViewModel>> {
  try {
    const context = await getViewModelContext();
    const result = await eventsContainer.getEvents.execute(query);
    return actionOk({
      items: result.items.map((event) => EventViewModelMapper.toViewModel(event, context)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return toActionError(error);
  }
}

export async function getEventByIdAction(id: string): Promise<ActionResult<EventViewModel>> {
  try {
    const context = await getViewModelContext();
    const event = await eventsContainer.getEventById.execute(id);
    return actionOk(EventViewModelMapper.toViewModel(event, context));
  } catch (error) {
    // Un id que no es UUID: la API responde 400; para la persona es lo mismo que no existir.
    return toActionError(error, { ...NOT_FOUND_MESSAGE, 400: NOT_FOUND_MESSAGE[404] });
  }
}

/** Lo que escribió la persona -> parámetros del dominio. Los opcionales vacíos quedan en null. */
function toEventParams(values: EventFormValues): CreateEventParams {
  return {
    name: values.name,
    description: values.description || null,
    city: values.city,
    date: values.date,
    location: values.location || null,
    organizer: values.organizer,
    // El dominio valida que sea un tipo conocido.
    type: values.type as EventType,
  };
}

/** Mensaje del backend cuando alguien sin permiso intenta modificar un evento. */
const FORBIDDEN_MESSAGE = {
  403: "Solo quien creó el evento, un moderador o un administrador pueden modificarlo.",
};

/*
 * Las acciones que escriben exigen sesión en su primera línea y FUERA del
 * try/catch: requireSession() redirige a /login lanzando una excepción, y el
 * catch no se la puede tragar. Una Server Action es un endpoint público.
 */

export async function createEventAction(
  values: EventFormValues,
): Promise<ActionResult<EventViewModel>> {
  await requireSession();
  try {
    const context = await getViewModelContext();
    const event = await eventsContainer.createEvent.execute(toEventParams(values));
    return actionOk(EventViewModelMapper.toViewModel(event, context));
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateEventAction(
  id: string,
  values: EventFormValues,
): Promise<ActionResult<EventViewModel>> {
  await requireSession();
  try {
    const context = await getViewModelContext();
    const params: UpdateEventParams = toEventParams(values);
    const event = await eventsContainer.updateEvent.execute(id, params);
    return actionOk(EventViewModelMapper.toViewModel(event, context));
  } catch (error) {
    return toActionError(error, { ...FORBIDDEN_MESSAGE, ...NOT_FOUND_MESSAGE });
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  try {
    await eventsContainer.deleteEvent.execute(id);
    return actionOk({ id });
  } catch (error) {
    return toActionError(error, { ...FORBIDDEN_MESSAGE, ...NOT_FOUND_MESSAGE });
  }
}
