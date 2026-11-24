"use server";

import { actionOk, toActionError, type ActionResult } from "@/src/core/errors";
import { requireSession } from "@/src/lib/dal";
import { profileContainer } from "../../di/profile.container";
import type { ProfileFormValues } from "../viewmodels/profile-form.viewmodel";
import { ProfileViewModelMapper, type ProfileViewModel } from "../viewmodels/profile.viewmodel";

/*
 * Server Actions del perfil. Exigen sesión en su primera línea y FUERA del
 * try/catch: requireSession() redirige a /login lanzando una excepción.
 * El perfil siempre es el de la sesión: no reciben id, así nadie edita el de otro.
 */

export async function getMyProfileAction(): Promise<ActionResult<ProfileViewModel>> {
  await requireSession();
  try {
    const profile = await profileContainer.getMyProfile.execute();
    return actionOk(ProfileViewModelMapper.toViewModel(profile));
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMyProfileAction(
  values: ProfileFormValues,
): Promise<ActionResult<ProfileViewModel>> {
  await requireSession();
  try {
    // Los opcionales vacíos los convierte en null el caso de uso (así se borran).
    const profile = await profileContainer.updateMyProfile.execute(values);
    return actionOk(ProfileViewModelMapper.toViewModel(profile));
  } catch (error) {
    return toActionError(error, { 409: "Ese nombre de usuario ya está en uso. Prueba con otro." });
  }
}
