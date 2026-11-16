import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import type { EventQuery } from "../../domain/repositories/event.repository";
import { getEventByIdAction, getEventsAction } from "../actions/events.actions";
import type { EventViewModel } from "../viewmodels/event.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_EVENTS_LIMIT = 10;

interface EventsState {
  /** Listado: la última consulta (filtros + página) y su resultado. */
  list: {
    query: EventQuery;
    items: EventViewModel[];
    total: number;
    status: RequestStatus;
    errorMessage: string | null;
    /** Id de la última petición: si llegan respuestas viejas fuera de orden, se ignoran. */
    requestId: string | null;
  };
  /** Detalle del evento abierto. */
  detail: {
    item: EventViewModel | null;
    status: RequestStatus;
    errorMessage: string | null;
  };
}

const initialState: EventsState = {
  list: {
    query: { page: 1, limit: DEFAULT_EVENTS_LIMIT },
    items: [],
    total: 0,
    status: "idle",
    errorMessage: null,
    requestId: null,
  },
  detail: { item: null, status: "idle", errorMessage: null },
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/*
 * Los thunks llaman a una Server Action (no al contenedor: es server-only).
 * Error esperado: la acción devuelve { ok: false } -> rejectWithValue(message).
 * Error inesperado (red, la acción revienta): catch -> rejectWithValue.
 */
export const fetchEvents = createAppThunk(
  "events/fetchList",
  async (query: EventQuery, { rejectWithValue }) => {
    try {
      const result = await getEventsAction(query);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchEventById = createAppThunk(
  "events/fetchDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await getEventByIdAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state, action) => {
        state.list.query = action.meta.arg;
        state.list.status = "loading";
        state.list.errorMessage = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.list.requestId) return;
        state.list.status = "succeeded";
        state.list.items = action.payload.items;
        state.list.total = action.payload.total;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.requestId !== state.list.requestId) return;
        state.list.status = "failed";
        state.list.items = [];
        state.list.total = 0;
        state.list.errorMessage = action.payload ?? "No se pudieron cargar los eventos";
      });

    builder
      .addCase(fetchEventById.pending, (state) => {
        state.detail.status = "loading";
        state.detail.errorMessage = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.detail.status = "succeeded";
        state.detail.item = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.detail.status = "failed";
        state.detail.item = null;
        state.detail.errorMessage = action.payload ?? "No se pudo cargar el evento";
      });
  },
});

export const eventsReducer = eventsSlice.reducer;
