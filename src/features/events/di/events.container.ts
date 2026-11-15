import "server-only";
import { GetEventByIdUseCase } from "../domain/usecases/get-event-by-id.usecase";
import { GetEventsUseCase } from "../domain/usecases/get-events.usecase";
import type { EventDatasource } from "../infrastructure/datasources/event-datasource.interface";
import { EventRestDatasource } from "../infrastructure/datasources/event-rest-datasource";
import { EventRepositoryImpl } from "../infrastructure/repositories/event.repository.impl";

/**
 * Raíz de composición de eventos: el único archivo que conoce las clases concretas.
 * Eventos es el módulo dual: NEXT_PUBLIC_DATA_SOURCE elige la fuente de datos y
 * nada más cambia (ni casos de uso, ni entidades, ni slice, ni componentes).
 */
function createEventDatasource(): EventDatasource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "rest";

  switch (source) {
    case "rest":
      return new EventRestDatasource();
    default:
      // "graphql" llega cuando el backend exponga eventos por GraphQL.
      throw new Error(
        `NEXT_PUBLIC_DATA_SOURCE="${source}" todavía no está soportado en eventos. Usa "rest".`,
      );
  }
}

const repository = new EventRepositoryImpl(createEventDatasource());

export const eventsContainer = {
  getEvents: new GetEventsUseCase(repository),
  getEventById: new GetEventByIdUseCase(repository),
};

export type EventsContainer = typeof eventsContainer;
