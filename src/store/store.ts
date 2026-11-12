import { configureStore } from "@reduxjs/toolkit";

/**
 * Crea un store nuevo. Es una fábrica y no un singleton porque en Next.js el
 * mismo módulo se reutiliza entre peticiones del servidor: un store global
 * mezclaría el estado de usuarios distintos. StoreProvider la llama una sola
 * vez por pestaña del navegador.
 *
 * Cómo registrar el reducer de una feature:
 *   1. El slice vive en su feature: src/features/<f>/presentation/store/<f>.slice.ts
 *      y exporta su reducer (por ejemplo, `export const authReducer = authSlice.reducer`).
 *   2. Se importa aquí y se agrega a `reducer` con el nombre de la feature:
 *
 *        import { authReducer } from "@/src/features/auth/presentation/store/auth.slice";
 *
 *        reducer: {
 *          auth: authReducer,
 *        },
 *
 *   3. RootState se actualiza solo: `useAppSelector((state) => state.auth)` ya
 *      queda tipado.
 *
 * src/store solo cablea los reducers; la lógica de cada slice vive en su feature.
 *
 * Mientras `reducer` esté vacío, Redux avisa en consola en desarrollo «Store does
 * not have a valid reducer». Es esperado y desaparece al registrar el primer slice.
 */
export const makeStore = () =>
  configureStore({
    reducer: {},
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
