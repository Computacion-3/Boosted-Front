import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import { loginAction, logoutAction } from "../actions/auth.actions";
import type { LoginFormValues } from "../schemas/login.schema";
import type { AuthUserViewModel } from "../viewmodels/auth-user.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthState {
  /** La persona con sesión, o null. Nunca guarda el token (vive en la cookie httpOnly). */
  user: AuthUserViewModel | null;
  status: RequestStatus;
  errorMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  errorMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/*
 * El thunk llama a una Server Action (no al contenedor: es server-only).
 * Error esperado: la acción devuelve { ok: false } -> rejectWithValue(message).
 * Error inesperado (red, la acción revienta): catch -> rejectWithValue.
 */
export const login = createAppThunk(
  "auth/login",
  async (values: LoginFormValues, { rejectWithValue }) => {
    try {
      const result = await loginAction(values);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * Cierra sesión. No hace falta un caso `fulfilled` en este slice: src/store/store.ts
 * escucha `auth/logout/fulfilled` y devuelve TODO el store a su estado inicial.
 */
export const logout = createAppThunk("auth/logout", async () => {
  await logoutAction();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Pone en Redux la sesión leída en el servidor (AuthHydrator), o null si no hay. */
    setUser: (state, action: PayloadAction<AuthUserViewModel | null>) => {
      state.user = action.payload;
    },
    clearAuthError: (state) => {
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.errorMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.errorMessage = action.payload ?? "No se pudo iniciar sesión";
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
