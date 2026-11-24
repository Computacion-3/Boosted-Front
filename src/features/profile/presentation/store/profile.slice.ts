import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import { getMyProfileAction, updateMyProfileAction } from "../actions/profile.actions";
import type { ProfileFormValues } from "../viewmodels/profile-form.viewmodel";
import type { ProfileViewModel } from "../viewmodels/profile.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface ProfileState {
  profile: ProfileViewModel | null;
  status: RequestStatus;
  errorMessage: string | null;
  /** Guardado del formulario en curso. */
  mutation: { isSaving: boolean; errorMessage: string | null };
}

const initialState: ProfileState = {
  profile: null,
  status: "idle",
  errorMessage: null,
  mutation: { isSaving: false, errorMessage: null },
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

// Los thunks llaman a la Server Action; un { ok: false } se vuelve rejectWithValue.
export const fetchMyProfile = createAppThunk("profile/fetch", async (_: void, { rejectWithValue }) => {
  try {
    const result = await getMyProfileAction();
    if (!result.ok) return rejectWithValue(result.message);
    return result.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateMyProfile = createAppThunk(
  "profile/update",
  async (values: ProfileFormValues, { rejectWithValue }) => {
    try {
      const result = await updateMyProfileAction(values);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileSaveError: (state) => {
      state.mutation.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = "loading";
        state.errorMessage = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.errorMessage = action.payload ?? "No se pudo cargar tu perfil";
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.mutation = { isSaving: true, errorMessage: null };
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.mutation.isSaving = false;
        state.profile = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.mutation = {
          isSaving: false,
          errorMessage: action.payload ?? "No se pudieron guardar los cambios",
        };
      });
  },
});

export const { clearProfileSaveError } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
