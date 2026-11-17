import { graphqlRequest } from "@/src/core/graphql/graphql-client";
import type { EventDto, EventQueryDto, PaginatedEventsDto } from "../dtos/event.dto";
import type { EventDatasource } from "./event-datasource.interface";

const EVENT_FIELDS = `id name description city date location organizer type createdById createdAt`;

const GET_EVENTS = `
  query GetEvents($page: Int, $limit: Int, $city: String, $type: String, $startDate: String, $endDate: String) {
    events(page: $page, limit: $limit, city: $city, type: $type, startDate: $startDate, endDate: $endDate) {
      data { ${EVENT_FIELDS} }
      total
      page
      limit
    }
  }
`;

const GET_EVENT = `
  query GetEvent($id: ID!) {
    event(id: $id) { ${EVENT_FIELDS} }
  }
`;

/**
 * Eventos por GraphQL: mismo contrato y mismos DTO que el datasource REST.
 * GraphQL responde HTTP 200 incluso con errores; el cliente ya los convierte en excepciones.
 * La lectura de eventos es pública en la API, por eso `auth: "none"`.
 */
export class EventGraphQLDatasource implements EventDatasource {
  async getEvents(query: EventQueryDto): Promise<PaginatedEventsDto> {
    // Se omiten undefined, null y "" (un `type` vacío fallaría la validación del enum).
    const variables: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        variables[key] = value;
      }
    }

    const data = await graphqlRequest<{ events: PaginatedEventsDto }>(GET_EVENTS, variables, {
      auth: "none",
    });
    return data.events;
  }

  async getEvent(id: string): Promise<EventDto> {
    const data = await graphqlRequest<{ event: EventDto }>(GET_EVENT, { id }, { auth: "none" });
    return data.event;
  }
}
