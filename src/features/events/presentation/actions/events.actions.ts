"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { getSession } from "@/src/lib/dal";
import { eventsContainer } from "../../di/events.container";
import type { EventQuery } from "../../domain/repositories/event.repository";
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
