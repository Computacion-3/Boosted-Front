import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { notificationsContainer } from "../../di/notifications.container";
import type { ConnectionStatus } from "../../domain/repositories/notifications.repository";
import {
  NotificationViewModelMapper,
  type NotificationViewModel,
} from "../viewmodels/notification.viewmodel";

/** Tope de notificaciones guardadas: las más viejas se descartan. */
export const MAX_NOTIFICATIONS = 50;

interface NotificationsState {
  /** Notificaciones recibidas, la más reciente primero. */
  items: NotificationViewModel[];
  /** Cuántas siguen sin leer. */
  unreadCount: number;
  /** Estado de la conexión en tiempo real. */
  connection: ConnectionStatus;
  /** Mensaje (en español) cuando la conexión se dio por perdida. */
  errorMessage: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  connection: "idle",
  errorMessage: null,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<NotificationViewModel>) => {
      if (state.items.some((item) => item.id === action.payload.id)) return;
      state.items = [action.payload, ...state.items].slice(0, MAX_NOTIFICATIONS);
      state.unreadCount = state.items.filter((item) => !item.isRead).length;
    },
    markAllRead: (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    connectionChanged: (
      state,
      action: PayloadAction<{ status: ConnectionStatus; errorMessage: string | null }>,
    ) => {
      state.connection = action.payload.status;
      state.errorMessage = action.payload.errorMessage;
    },
  },
});

export const { notificationReceived, markAllRead, clearNotifications, connectionChanged } =
  notificationsSlice.actions;

const createAppThunk = createAsyncThunk.withTypes<{ rejectValue: string }>();

/*
 * El oyente despacha cada evento entrante directo al store, sin recargar la página.
 * Es idempotente: si ya hay una conexión en curso, el repositorio ignora el segundo `connect`.
 */
export const startNotifications = createAppThunk(
  "notifications/start",
  (_: void, { dispatch }) => {
    notificationsContainer.connectNotifications.execute({
      onNotification: (notification) => {
        dispatch(notificationReceived(NotificationViewModelMapper.toViewModel(notification)));
      },
      onConnectionChange: (status, errorMessage) => {
        dispatch(connectionChanged({ status, errorMessage: errorMessage ?? null }));
      },
    });
  },
);

/** Cierra la conexión y vacía la lista (por ejemplo, al cerrar sesión). */
export const stopNotifications = createAppThunk(
  "notifications/stop",
  (_: void, { dispatch }) => {
    notificationsContainer.disconnectNotifications.execute();
    dispatch(clearNotifications());
  },
);

export const notificationsReducer = notificationsSlice.reducer;
