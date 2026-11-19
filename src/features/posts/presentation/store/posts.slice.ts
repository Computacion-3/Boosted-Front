import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import type { PostQuery } from "../../domain/repositories/post.repository";
import { getPostsAction, togglePostLikeAction } from "../actions/posts.actions";
import { formatLikesLabel, type PostViewModel } from "../viewmodels/post.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_POSTS_LIMIT = 10;

/** Aviso global de la pantalla de publicaciones (p. ej. un me gusta que falló). */
export interface PostsFeedback {
  id: string;
  tone: "success" | "error";
  message: string;
}

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
  /** Publicaciones con una petición de me gusta en curso. */
  likingIds: string[];
  /** Valores previos al cambio optimista, para revertir si la petición falla. */
  likeSnapshots: Record<string, { likedByMe: boolean; likeCount: number }>;
  feedback: PostsFeedback | null;
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
  likingIds: [],
  likeSnapshots: {},
  feedback: null,
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

export const togglePostLike = createAppThunk(
  "posts/toggleLike",
  async (postId: string, { rejectWithValue }) => {
    try {
      const result = await togglePostLikeAction(postId);
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
  reducers: {
    dismissFeedback(state) {
      state.feedback = null;
    },
  },
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
      })
      // Me gusta optimista: se refleja al instante y se revierte si el servidor falla.
      .addCase(togglePostLike.pending, (state, action) => {
        const postId = action.meta.arg;
        if (!state.likingIds.includes(postId)) state.likingIds.push(postId);
        const item = state.list.items.find((post) => post.id === postId);
        if (item && !state.likeSnapshots[postId]) {
          state.likeSnapshots[postId] = { likedByMe: item.likedByMe, likeCount: item.likeCount };
          item.likedByMe = !item.likedByMe;
          item.likeCount = Math.max(0, item.likeCount + (item.likedByMe ? 1 : -1));
          item.likesLabel = formatLikesLabel(item.likeCount);
        }
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        const index = state.list.items.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) state.list.items[index] = action.payload;
        state.likingIds = state.likingIds.filter((id) => id !== postId);
        delete state.likeSnapshots[postId];
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        const postId = action.meta.arg;
        const item = state.list.items.find((post) => post.id === postId);
        const snapshot = state.likeSnapshots[postId];
        if (item && snapshot) {
          item.likedByMe = snapshot.likedByMe;
          item.likeCount = snapshot.likeCount;
          item.likesLabel = formatLikesLabel(snapshot.likeCount);
        }
        state.likingIds = state.likingIds.filter((id) => id !== postId);
        delete state.likeSnapshots[postId];
        state.feedback = {
          id: action.meta.requestId,
          tone: "error",
          message: action.payload ?? "No se pudo actualizar tu me gusta",
        };
      });
  },
});

export const { dismissFeedback } = postsSlice.actions;
export const postsReducer = postsSlice.reducer;
