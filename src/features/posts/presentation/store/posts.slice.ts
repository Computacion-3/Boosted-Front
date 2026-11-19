import { createAsyncThunk, createSlice, type Draft } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/core/errors";
import type { PostQuery } from "../../domain/repositories/post.repository";
import {
  createPostAction,
  deletePostAction,
  getPostAction,
  getPostsAction,
  hidePostAction,
  restorePostAction,
  togglePostLikeAction,
  updatePostAction,
} from "../actions/posts.actions";
import type { PostFormValues } from "../viewmodels/post-form.viewmodel";
import { formatLikesLabel, type PostViewModel } from "../viewmodels/post.viewmodel";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export const DEFAULT_POSTS_LIMIT = 10;

/** Aviso global de la pantalla de publicaciones (p. ej. un me gusta que falló). */
export interface PostsFeedback {
  id: string;
  tone: "success" | "error";
  message: string;
  /**
   * Pantalla que debe mostrarlo. Un éxito (crear, editar, eliminar) se muestra en la pantalla
   * a la que se navega, no en la que lo provocó; sin `target`, lo muestra la pantalla actual.
   */
  target?: "detail" | "feed";
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
  /** Detalle de una publicación (pantalla de la publicación y su edición). */
  detail: {
    post: PostViewModel | null;
    status: RequestStatus;
    errorMessage: string | null;
    requestId: string | null;
  };
  /** Crear, editar o eliminar: un error de formulario se muestra en línea. */
  mutation: {
    status: "idle" | "submitting";
    errorMessage: string | null;
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
  detail: { post: null, status: "idle", errorMessage: null, requestId: null },
  mutation: { status: "idle", errorMessage: null },
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

export const fetchPost = createAppThunk(
  "posts/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await getPostAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createPost = createAppThunk(
  "posts/create",
  async (values: PostFormValues, { rejectWithValue }) => {
    try {
      const result = await createPostAction(values);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updatePost = createAppThunk(
  "posts/update",
  async (arg: { id: string; values: PostFormValues }, { rejectWithValue }) => {
    try {
      const result = await updatePostAction(arg.id, arg.values);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deletePost = createAppThunk(
  "posts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await deletePostAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const hidePost = createAppThunk(
  "posts/hide",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await hidePostAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const restorePost = createAppThunk(
  "posts/restore",
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await restorePostAction(id);
      if (!result.ok) return rejectWithValue(result.message);
      return result.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/** Aplica el mismo cambio a la publicación del feed y a la del detalle (si es la misma). */
function applyToPost(state: PostsState, postId: string, apply: (post: Draft<PostViewModel>) => void) {
  const item = state.list.items.find((post) => post.id === postId);
  if (item) apply(item);
  if (state.detail.post?.id === postId) apply(state.detail.post);
}

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
        const current =
          state.list.items.find((post) => post.id === postId) ??
          (state.detail.post?.id === postId ? state.detail.post : undefined);
        if (current && !state.likeSnapshots[postId]) {
          state.likeSnapshots[postId] = {
            likedByMe: current.likedByMe,
            likeCount: current.likeCount,
          };
          applyToPost(state, postId, (post) => {
            post.likedByMe = !post.likedByMe;
            post.likeCount = Math.max(0, post.likeCount + (post.likedByMe ? 1 : -1));
            post.likesLabel = formatLikesLabel(post.likeCount);
          });
        }
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        const index = state.list.items.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) state.list.items[index] = action.payload;
        if (state.detail.post?.id === action.payload.id) state.detail.post = action.payload;
        state.likingIds = state.likingIds.filter((id) => id !== postId);
        delete state.likeSnapshots[postId];
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        const postId = action.meta.arg;
        const snapshot = state.likeSnapshots[postId];
        if (snapshot) {
          applyToPost(state, postId, (post) => {
            post.likedByMe = snapshot.likedByMe;
            post.likeCount = snapshot.likeCount;
            post.likesLabel = formatLikesLabel(snapshot.likeCount);
          });
        }
        state.likingIds = state.likingIds.filter((id) => id !== postId);
        delete state.likeSnapshots[postId];
        state.feedback = {
          id: action.meta.requestId,
          tone: "error",
          message: action.payload ?? "No se pudo actualizar tu me gusta",
        };
      })
      .addCase(fetchPost.pending, (state, action) => {
        if (state.detail.post?.id !== action.meta.arg) state.detail.post = null;
        state.detail.status = "loading";
        state.detail.errorMessage = null;
        state.detail.requestId = action.meta.requestId;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.detail.requestId) return;
        state.detail.post = action.payload;
        state.detail.status = "succeeded";
      })
      .addCase(fetchPost.rejected, (state, action) => {
        if (action.meta.requestId !== state.detail.requestId) return;
        state.detail.status = "failed";
        state.detail.post = null;
        state.detail.errorMessage = action.payload ?? "No se pudo cargar la publicación";
      })
      .addCase(createPost.pending, (state) => {
        state.mutation = { status: "submitting", errorMessage: null };
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.mutation.status = "idle";
        state.detail.post = action.payload;
        state.detail.status = "succeeded";
        state.detail.errorMessage = null;
        state.list.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "success",
          message: "Publicación creada",
          target: "detail",
        };
      })
      .addCase(createPost.rejected, (state, action) => {
        state.mutation = {
          status: "idle",
          errorMessage: action.payload ?? "No se pudo crear la publicación",
        };
      })
      .addCase(updatePost.pending, (state) => {
        state.mutation = { status: "submitting", errorMessage: null };
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.mutation.status = "idle";
        const index = state.list.items.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) state.list.items[index] = action.payload;
        state.detail.post = action.payload;
        state.feedback = {
          id: action.meta.requestId,
          tone: "success",
          message: "Cambios guardados",
          target: "detail",
        };
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.mutation = {
          status: "idle",
          errorMessage: action.payload ?? "No se pudieron guardar los cambios",
        };
      })
      .addCase(deletePost.pending, (state) => {
        state.mutation = { status: "submitting", errorMessage: null };
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        state.mutation.status = "idle";
        if (state.list.items.some((post) => post.id === postId)) {
          state.list.items = state.list.items.filter((post) => post.id !== postId);
          state.list.total = Math.max(0, state.list.total - 1);
        }
        if (state.detail.post?.id === postId) {
          state.detail.post = null;
          state.detail.status = "idle";
        }
        state.list.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "success",
          message: "Publicación eliminada",
          target: "feed",
        };
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.mutation.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "error",
          message: action.payload ?? "No se pudo eliminar la publicación",
        };
      })
      // Moderación: el detalle se actualiza con lo que devuelve el servidor y el aviso sale en esa misma pantalla.
      .addCase(hidePost.pending, (state) => {
        state.mutation = { status: "submitting", errorMessage: null };
      })
      .addCase(hidePost.fulfilled, (state, action) => {
        state.mutation.status = "idle";
        // El feed no muestra publicaciones ocultas: sale de la lista, que se recarga al volver.
        if (state.list.items.some((post) => post.id === action.payload.id)) {
          state.list.items = state.list.items.filter((post) => post.id !== action.payload.id);
          state.list.total = Math.max(0, state.list.total - 1);
        }
        if (state.detail.post?.id === action.payload.id) state.detail.post = action.payload;
        state.list.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "success",
          message: "Publicación oculta. Puedes restaurarla desde esta página.",
          target: "detail",
        };
      })
      .addCase(hidePost.rejected, (state, action) => {
        state.mutation.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "error",
          message: action.payload ?? "No se pudo ocultar la publicación",
          target: "detail",
        };
      })
      .addCase(restorePost.pending, (state) => {
        state.mutation = { status: "submitting", errorMessage: null };
      })
      .addCase(restorePost.fulfilled, (state, action) => {
        state.mutation.status = "idle";
        if (state.detail.post?.id === action.payload.id) state.detail.post = action.payload;
        // La publicación vuelve a aparecer en el feed: hay que pedirlo de nuevo.
        state.list.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "success",
          message: "Publicación restaurada",
          target: "detail",
        };
      })
      .addCase(restorePost.rejected, (state, action) => {
        state.mutation.status = "idle";
        state.feedback = {
          id: action.meta.requestId,
          tone: "error",
          message: action.payload ?? "No se pudo restaurar la publicación",
          target: "detail",
        };
      });
  },
});

export const { dismissFeedback } = postsSlice.actions;
export const postsReducer = postsSlice.reducer;
