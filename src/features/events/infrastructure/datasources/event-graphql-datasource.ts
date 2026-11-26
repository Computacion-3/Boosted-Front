import { graphqlRequest } from "@/src/core/graphql/graphql-client";
import type {
  CreateEventDto,
  EventDto,
  EventQueryDto,
  PaginatedEventsDto,
  UpdateEventDto,
} from "../dtos/event.dto";
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

const CREATE_EVENT = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) { ${EVENT_FIELDS} }
  }
`;

const UPDATE_EVENT = `
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) { ${EVENT_FIELDS} }
  }
`;

// La API responde `true` y nada más: no hay evento que devolver al eliminar.
const REMOVE_EVENT = `
  mutation RemoveEvent($id: ID!) {
    removeEvent(id: $id)
  }
`;

/**
 * Eventos por GraphQL: mismo contrato y mismos DTO que el datasource REST.
 * GraphQL responde HTTP 200 incluso con errores; el cliente ya los convierte en excepciones
 * (con el mismo status que daría REST: 403 sin permiso, 404 si el evento no existe).
 * La lectura de eventos es pública en la API, por eso `auth: "none"`; las mutaciones
 * exigen sesión (`auth: "required"`, el valor por defecto del cliente).
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

  async createEvent(dto: CreateEventDto): Promise<EventDto> {
    const data = await graphqlRequest<{ createEvent: EventDto }>(CREATE_EVENT, { input: dto });
    return data.createEvent;
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<EventDto> {
    const data = await graphqlRequest<{ updateEvent: EventDto }>(UPDATE_EVENT, {
      id,
      input: dto,
    });
    return data.updateEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await graphqlRequest<{ removeEvent: boolean }>(REMOVE_EVENT, { id });
  }
}
