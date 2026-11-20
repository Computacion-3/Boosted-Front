import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import {
  addCommentAction,
  deleteCommentAction,
  getCommentsAction,
  updateCommentAction,
} from "../actions/comments.actions";
import type { CommentViewModel } from "../viewmodels/comment.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface CommentsState {
  /** Publicación cuyos comentarios están cargados (o cargándose). */
  postId: string | null;
  /** Comentarios de la publicación, del más antiguo al más reciente. */
  items: CommentViewModel[];
  /** Estado de la carga de la lista. */
  status: RequestStatus;
  /** Error de la carga de la lista. */
  errorMessage: string | null;
  /** Id de la última petición de la lista: si llegan respuestas viejas fuera de orden, se ignoran. */
  requestId: string | null;
  /** Publicar un comentario nuevo: el error se muestra en línea, junto al formulario. */
  adding: {
    status: "idle" | "submitting";
    errorMessage: string | null;
  };
  /** Comentarios con una petición de editar o eliminar en curso. */
  busyIds: string[];
  /** Error en línea de cada comentario (no hay toasts aquí), por id. */
  itemErrors: Record<string, string>;
}

const initialState: CommentsState = {
  postId: null,
  items: [],
  status: "idle",
  errorMessage: null,
  requestId: null,
  adding: { status: "idle", errorMessage: null },
  busyIds: [],
  itemErrors: {},
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/*
 * El thunk llama a una Server Action (no al contenedor: es server-only).
 * Error esperado: la acción devuelve { ok: false } -> rejectWithValue(message).
 * Error inesperado (red, la acción revienta): catch -> rejectWithValue.
 */
export const fetchComments = createAppThunk(
  "comments/fetchList",
  async (postId: string, { rejectWithValue }) => {
    try {
      const result = await getCommentsAction(postId);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const addComment = createAppThunk(
  "comments/add",
  async (arg: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const result = await addCommentAction(arg.postId, arg.content);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateComment = createAppThunk(
  "comments/update",
  async (arg: { id: string; content: string }, { rejectWithValue }) => {
    try {
      const result = await updateCommentAction(arg.id, arg.content);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteComment = createAppThunk(
  "comments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await deleteCommentAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Marca un comentario como ocupado y limpia su error en línea. */
function markBusy(state: CommentsState, id: string) {
  if (!state.busyIds.includes(id)) state.busyIds.push(id);
  delete state.itemErrors[id];
}

export const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        if (state.postId !== action.meta.arg) state.items = [];
        state.postId = action.meta.arg;
        state.status = "loading";
        state.errorMessage = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchComments.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.status = "failed";
        state.items = [];
        state.errorMessage = action.payload ?? "No se pudieron cargar los comentarios";
      })
      .addCase(addComment.pending, (state) => {
        state.adding = { status: "submitting", errorMessage: null };
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.adding.status = "idle";
        const created = action.payload;
        if (
          state.postId === action.meta.arg.postId &&
          !state.items.some((comment) => comment.id === created.id)
        ) {
          state.items.push(created);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.adding = {
          status: "idle",
          errorMessage: action.payload ?? "No se pudo publicar el comentario",
        };
      })
      .addCase(updateComment.pending, (state, action) => {
        markBusy(state, action.meta.arg.id);
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.items.findIndex((comment) => comment.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.busyIds = state.busyIds.filter((id) => id !== action.meta.arg.id);
      })
      .addCase(updateComment.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.busyIds = state.busyIds.filter((busyId) => busyId !== id);
        state.itemErrors[id] = action.payload ?? "No se pudo guardar el comentario";
      })
      .addCase(deleteComment.pending, (state, action) => {
        markBusy(state, action.meta.arg);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.items = state.items.filter((comment) => comment.id !== id);
        state.busyIds = state.busyIds.filter((busyId) => busyId !== id);
        delete state.itemErrors[id];
      })
      .addCase(deleteComment.rejected, (state, action) => {
        const id = action.meta.arg;
        state.busyIds = state.busyIds.filter((busyId) => busyId !== id);
        state.itemErrors[id] = action.payload ?? "No se pudo eliminar el comentario";
      });
  },
});

export const commentsReducer = commentsSlice.reducer;
