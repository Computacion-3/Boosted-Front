import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import { getRolesOverviewAction, updateRolePermissionsAction } from "../actions/roles.actions";
import type { PermissionViewModel, RoleViewModel } from "../viewmodels/role.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface RolesState {
  roles: RoleViewModel[];
  permissions: PermissionViewModel[];
  status: RequestStatus;
  errorMessage: string | null;
  /** Rol que se está guardando. */
  savingRole: string | null;
  /** Error al guardar, con el rol al que pertenece (se muestra en su tarjeta). */
  saveError: { role: string; message: string } | null;
  /** Último rol guardado con éxito (para el aviso «Cambios guardados»). */
  savedRole: string | null;
}

const initialState: RolesState = {
  roles: [],
  permissions: [],
  status: "idle",
  errorMessage: null,
  savingRole: null,
  saveError: null,
  savedRole: null,
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

export const fetchRolesOverview = createAppThunk("roles/fetchOverview", async (_: void, { rejectWithValue }) => {
  try {
    const result = await getRolesOverviewAction();
    if (!result.ok) return rejectWithValue(result.message);
    return result.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const saveRolePermissions = createAppThunk(
  "roles/savePermissions",
  async ({ role, permissions }: { role: string; permissions: string[] }, { rejectWithValue }) => {
    try {
      const result = await updateRolePermissionsAction(role, permissions);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearRolesFeedback: (state) => {
      state.saveError = null;
      state.savedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesOverview.pending, (state) => {
        state.status = "loading";
        state.errorMessage = null;
      })
      .addCase(fetchRolesOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchRolesOverview.rejected, (state, action) => {
        state.status = "failed";
        state.errorMessage = action.payload ?? "No se pudieron cargar los roles";
      });

    builder
      .addCase(saveRolePermissions.pending, (state, action) => {
        state.savingRole = action.meta.arg.role;
        state.saveError = null;
        state.savedRole = null;
      })
      .addCase(saveRolePermissions.fulfilled, (state, action) => {
        state.savingRole = null;
        state.savedRole = action.payload.role;
        state.roles = state.roles.map((role) => (role.role === action.payload.role ? action.payload : role));
      })
      .addCase(saveRolePermissions.rejected, (state, action) => {
        state.savingRole = null;
        state.saveError = {
          role: action.meta.arg.role,
          message: action.payload ?? "No se pudieron guardar los permisos",
        };
      });
  },
});

export const { clearRolesFeedback } = rolesSlice.actions;
export const rolesReducer = rolesSlice.reducer;
