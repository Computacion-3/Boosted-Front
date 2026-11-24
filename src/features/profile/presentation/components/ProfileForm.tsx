"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, TextareaField } from "@/src/core/components/ui";
import {
  PROFILE_BIO_MAX,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from "../viewmodels/profile-form.viewmodel";

export type ProfileFormProps = {
  initialValues: ProfileFormValues;
  /** Correo de la cuenta: se muestra, pero no se edita. */
  email: string;
  isSaving: boolean;
  /** Error del servidor (409 usuario repetido, validación de la API…). */
  errorMessage?: string | null;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
};

/** Formulario para editar el perfil, con validación visual campo por campo. */
export function ProfileForm({
  initialValues,
  email,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const update = (field: keyof ProfileFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateProfileForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label="Nombre" required maxLength={100} value={values.name} onChange={update("name")} error={errors.name} />
        <FormField
          label="Nombre de usuario"
          required
          maxLength={30}
          autoComplete="username"
          value={values.username}
          onChange={update("username")}
          error={errors.username}
          hint="Letras, números y guion bajo"
        />
      </div>
      <FormField label="Correo" value={email} disabled readOnly hint="El correo no se puede cambiar" />
      <TextareaField
        label="Biografía"
        rows={4}
        maxLength={PROFILE_BIO_MAX}
        value={values.bio}
        onChange={update("bio")}
        error={errors.bio}
        hint={`${values.bio.length}/${PROFILE_BIO_MAX}. Cuéntale a la comunidad qué carros te gustan`}
      />
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label="Ciudad" value={values.city} onChange={update("city")} />
        <FormField label="País" value={values.country} onChange={update("country")} />
      </div>
      <FormField
        label="Foto de perfil (URL)"
        type="url"
        placeholder="https://…"
        value={values.avatarUrl}
        onChange={update("avatarUrl")}
        error={errors.avatarUrl}
        hint="Opcional: el enlace a una imagen"
      />

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSaving}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
