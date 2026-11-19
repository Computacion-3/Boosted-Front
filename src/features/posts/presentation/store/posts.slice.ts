import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import type { PostQuery } from "../../domain/repositories/post.repository";
import { getPostsAction } from "../actions/posts.actions";
import type { PostViewModel } from "../viewmodels/post.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_POSTS_LIMIT = 10;

interface PostsState {
  /** Feed: la última consulta (filtros + página) y su resultado. */
  list: {
    query: PostQuery;
    items: PostViewModel[];
    total: number;
    status: RequestStatus;
    errorMessage: string | null;
    /** Id de la última petición: si llegan respuestas viejas fuera de orden, se ignoran. */
    requestId: string | null;
  };
}

const initialState: PostsState = {
  list: {
    query: { page: 1, limit: DEFAULT_POSTS_LIMIT },
    items: [],
    total: 0,
    status: "idle",
    errorMessage: null,
    requestId: null,
  },
};

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/*
 * El thunk llama a una Server Action (no al contenedor: es server-only).
 * Error esperado: la acción devuelve { ok: false } -> rejectWithValue(message).
 * Error inesperado (red, la acción revienta): catch -> rejectWithValue.
 */
export const fetchPosts = createAppThunk(
  "posts/fetchList",
  async (query: PostQuery, { rejectWithValue }) => {
    try {
      const result = await getPostsAction(query);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.list.query = action.meta.arg;
        state.list.status = "loading";
        state.list.errorMessage = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.list.requestId) return;
        state.list.status = "succeeded";
        state.list.items = action.payload.items;
        state.list.total = action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        if (action.meta.requestId !== state.list.requestId) return;
        state.list.status = "failed";
        state.list.items = [];
        state.list.total = 0;
        state.list.errorMessage = action.payload ?? "No se pudieron cargar las publicaciones";
      });
  },
});

export const postsReducer = postsSlice.reducer;
