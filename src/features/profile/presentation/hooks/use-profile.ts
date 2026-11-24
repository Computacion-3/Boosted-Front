"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { clearProfileSaveError, fetchMyProfile, updateMyProfile } from "../store/profile.slice";
import type { ProfileFormValues } from "../viewmodels/profile-form.viewmodel";

/**
 * Hook fachada del perfil propio: lo carga al montar y expone cómo guardarlo.
 * `saveProfile` devuelve si salió bien, así la pantalla decide qué mostrar.
 */
export function useProfile() {
  const dispatch = useAppDispatch();
  const { profile, status, errorMessage, mutation } = useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  const reload = useCallback(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  const saveProfile = useCallback(
    async (values: ProfileFormValues): Promise<boolean> => {
      const result = await dispatch(updateMyProfile(values));
      return updateMyProfile.fulfilled.match(result);
    },
    [dispatch],
  );

  const clearSaveError = useCallback(() => {
    dispatch(clearProfileSaveError());
  }, [dispatch]);

  return {
    profile,
    // Mientras no haya perfil, cualquier estado que no sea error cuenta como cargando.
    isLoading: !profile && status !== "failed",
    errorMessage,
    reload,
    saveProfile,
    isSaving: mutation.isSaving,
    saveError: mutation.errorMessage,
    clearSaveError,
  };
}
