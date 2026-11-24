import type { ProfileViewModel } from "./profile.viewmodel";

/** Valores del formulario de perfil, tal como los escribe la persona (todo texto). */
export interface ProfileFormValues {
  name: string;
  username: string;
  bio: string;
  city: string;
  country: string;
  avatarUrl: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

export const PROFILE_BIO_MAX = 500;

/** El formulario arranca con los datos actuales del perfil. */
export function profileToFormValues(profile: ProfileViewModel): ProfileFormValues {
  return {
    name: profile.name,
    username: profile.username,
    bio: profile.bio ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

/**
 * Validación visual del formulario (feedback inmediato, campo por campo).
 * No reemplaza a la del dominio ni a la del backend: las tres se cumplen.
 */
export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const name = values.name.trim();
  const username = values.username.trim();
  const avatarUrl = values.avatarUrl.trim();

  if (!name) errors.name = "Escribe tu nombre";
  else if (name.length > 100) errors.name = "Máximo 100 caracteres";

  if (username.length < 3 || username.length > 30) {
    errors.username = "Debe tener entre 3 y 30 caracteres";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Solo letras, números y guion bajo (sin espacios ni tildes)";
  }

  if (values.bio.length > PROFILE_BIO_MAX) errors.bio = `Máximo ${PROFILE_BIO_MAX} caracteres`;

  if (avatarUrl && !/^https?:\/\/\S+$/.test(avatarUrl)) {
    errors.avatarUrl = "Debe ser una URL que empiece por http:// o https://";
  }
  return errors;
}
