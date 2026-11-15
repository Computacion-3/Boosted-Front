"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, SelectField, TextareaField } from "@/src/core/components/ui";
import {
  EMPTY_EVENT_FORM,
  validateEventForm,
  type EventFormErrors,
  type EventFormValues,
} from "../viewmodels/event-form.viewmodel";
import { EVENT_TYPE_OPTIONS } from "../viewmodels/event.viewmodel";

export type EventFormProps = {
  initialValues?: EventFormValues;
  submitLabel: string;
  isSaving: boolean;
  /** Error del servidor (403, 404, validación de la API…). */
  errorMessage?: string | null;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
};

/** Formulario para crear o editar un evento, con validación visual campo por campo. */
export function EventForm({
  initialValues = EMPTY_EVENT_FORM,
  submitLabel,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(initialValues);
  const [errors, setErrors] = useState<EventFormErrors>({});

  const update = (field: keyof EventFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    // Al corregir un campo, su error desaparece.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateEventForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2">
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <FormField label="Nombre" required maxLength={120} value={values.name} onChange={update("name")} error={errors.name} />
      <TextareaField
        label="Descripción"
        rows={4}
        value={values.description}
        onChange={update("description")}
        hint="Opcional: qué habrá, qué traer, requisitos…"
      />
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField label="Ciudad" required value={values.city} onChange={update("city")} error={errors.city} />
        <FormField label="Fecha" type="date" required value={values.date} onChange={update("date")} error={errors.date} />
        <FormField
          label="Lugar"
          value={values.location}
          onChange={update("location")}
          hint="Opcional: un punto de referencia general"
        />
        <FormField
          label="Organizador"
          required
          value={values.organizer}
          onChange={update("organizer")}
          error={errors.organizer}
        />
        <SelectField
          label="Tipo"
          required
          placeholder="Elige un tipo"
          options={EVENT_TYPE_OPTIONS}
          value={values.type}
          onChange={update("type")}
          error={errors.type}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
