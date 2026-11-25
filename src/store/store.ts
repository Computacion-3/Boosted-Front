import { garageReducer } from "@/src/features/garage/presentation/store/garage.slice";
import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import { authReducer, logout } from "@/src/features/auth/presentation/store/auth.slice";
import { commentsReducer } from "@/src/features/comments/presentation/store/comments.slice";
import { eventsReducer } from "@/src/features/events/presentation/store/events.slice";
import { notificationsReducer } from "@/src/features/notifications/presentation/store/notifications.slice";
import { postsReducer } from "@/src/features/posts/presentation/store/posts.slice";
import { profileReducer } from "@/src/features/profile/presentation/store/profile.slice";
import { rolesReducer } from "@/src/features/roles/presentation/store/roles.slice";
import { usersReducer } from "@/src/features/users/presentation/store/users.slice";

/**
 * Cómo registrar el reducer de una feature:
 *   1. El slice vive en su feature: src/features/<f>/presentation/store/<f>.slice.ts
 *      y exporta su reducer (por ejemplo, `export const authReducer = authSlice.reducer`).
 *   2. Se importa aquí y se agrega a `appReducer` con el nombre de la feature:
 *
 *        const appReducer = combineReducers({
  garage: garageReducer,
 *          auth: authReducer,
 *          posts: postsReducer,
 *        });
 *
 *   3. RootState se actualiza solo: `useAppSelector((state) => state.posts)` ya
 *      queda tipado.
 *
 * src/store solo cablea los reducers; la lógica de cada slice vive en su feature.
 */
const appReducer = combineReducers({
  garage: garageReducer,
  auth: authReducer,
  comments: commentsReducer,
  events: eventsReducer,
  notifications: notificationsReducer,
  posts: postsReducer,
  profile: profileReducer,
  roles: rolesReducer,
  users: usersReducer,
});

/**
 * Al cerrar sesión se vacía TODO el store, no solo `auth`: así no quedan en
 * memoria los datos de la persona anterior (sus vehículos, publicaciones…).
 * Pasarle `undefined` a cada reducer lo devuelve a su estado inicial.
 */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (logout.fulfilled.match(action)) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

/**
 * Crea un store nuevo. Es una fábrica y no un singleton porque en Next.js el
 * mismo módulo se reutiliza entre peticiones del servidor: un store global
 * mezclaría el estado de usuarios distintos. StoreProvider la llama una sola
 * vez por pestaña del navegador.
 */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
