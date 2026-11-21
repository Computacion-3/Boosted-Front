import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import type { UserQuery } from "../../domain/repositories/user.repository";
import { changeUserRoleAction, changeUserStatusAction, getUsersAction } from "../actions/users.actions";
import type { ManagedUserViewModel } from "../viewmodels/managed-user.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_USERS_LIMIT = 10;

interface UsersState {
  query: UserQuery;
  items: ManagedUserViewModel[];
  total: number;
  status: RequestStatus;
  errorMessage: string | null;
  /** Id de la última petición del listado: las respuestas viejas se ignoran. */
  requestId: string | null;
  /** Usuario que se está modificando (para mostrar el spinner en su fila). */
  savingId: string | null;
  /** Error al cambiar rol o estado (por ejemplo, el 400 de «tu propia cuenta»). */
  saveError: string | null;
}

const initialState: UsersState = {
  query: { page: 1, limit: DEFAULT_USERS_LIMIT },
  items: [],
  total: 0,
  status: "idle",
  errorMessage: null,
  requestId: null,
  savingId: null,
  saveError: null,
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/* Los thunks llaman a Server Actions (el contenedor es server-only). */

export const fetchUsers = createAppThunk("users/fetchList", async (query: UserQuery, { rejectWithValue }) => {
  try {
    const result = await getUsersAction(query);
    if (!result.ok) return rejectWithValue(result.message);
    return result.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const changeUserRole = createAppThunk(
  "users/changeRole",
  async ({ id, role }: { id: string; role: string }, { rejectWithValue }) => {
    try {
      const result = await changeUserRoleAction(id, role);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const changeUserStatus = createAppThunk(
  "users/changeStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const result = await changeUserStatusAction(id, status);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Reemplaza la fila del usuario actualizado sin volver a pedir la lista. */
function replaceItem(state: UsersState, user: ManagedUserViewModel) {
  state.items = state.items.map((item) => (item.id === user.id ? user : item));
}

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersSaveError: (state) => {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.query = action.meta.arg;
        state.status = "loading";
        state.errorMessage = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "failed";
        state.items = [];
        state.total = 0;
        state.errorMessage = action.payload ?? "No se pudieron cargar los usuarios";
      });

    for (const thunk of [changeUserRole, changeUserStatus]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.savingId = action.meta.arg.id;
          state.saveError = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.savingId = null;
          replaceItem(state, action.payload);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.savingId = null;
          state.saveError = action.payload ?? "No se pudo guardar el cambio";
        });
    }
  },
});

export const { clearUsersSaveError } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
