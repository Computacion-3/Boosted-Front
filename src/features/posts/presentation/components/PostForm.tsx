"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert, Button, FormField, SelectField, TextareaField } from "@/src/core/components/ui";
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  validatePostForm,
  type PostFormValues,
} from "../viewmodels/post-form.viewmodel";
import { POST_TYPE_OPTIONS } from "../viewmodels/post.viewmodel";

export type PostFormProps = {
  initialValues: PostFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  /** Error del servidor (403, 404, validación de la API…). */
  errorMessage: string | null;
  onSubmit: (values: PostFormValues) => void;
  onCancel: () => void;
};

/** Formulario para crear o editar una publicación. Los campos extra dependen del tipo. */
export function PostForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues);
  const [attempts, setAttempts] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Los errores aparecen tras el primer intento de envío y se actualizan al editar.
  const errors = attempts > 0 ? validatePostForm(values) : {};

  // Tras un intento fallido, el foco va al primer campo inválido.
  useEffect(() => {
    if (attempts === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempts]);

  const update = (field: keyof PostFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleTypeChange = (event: { target: { value: string } }) => {
    const type = event.target.value as PostFormValues["type"];
    setValues((current) => ({
      ...current,
      type,
      // Se vacían los campos que ya no aplican al nuevo tipo.
      questionDetails: type === "pregunta" ? current.questionDetails : "",
      eventDate: type === "evento" ? current.eventDate : "",
      eventCity: type === "evento" ? current.eventCity : "",
      eventLocation: type === "evento" ? current.eventLocation : "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Object.keys(validatePostForm(values)).length > 0) {
      setAttempts((current) => current + 1);
      return;
    }
    onSubmit(values);
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 max-sm:[&_input]:text-base max-sm:[&_select]:text-base max-sm:[&_textarea]:text-base"
    >
      <FormField
        label="Título"
        autoComplete="off"
        required
        maxLength={POST_TITLE_MAX_LENGTH}
        value={values.title}
        onChange={update("title")}
        error={errors.title}
      />
      <SelectField
        label="Tipo"
        options={POST_TYPE_OPTIONS}
        value={values.type}
        onChange={handleTypeChange}
      />
      <TextareaField
        label="Contenido"
        required
        rows={6}
        value={values.content}
        onChange={update("content")}
        error={errors.content}
        hint={`${values.content.length}/${POST_CONTENT_MAX_LENGTH}`}
      />
      <FormField
        label="Vehículo (opcional)"
        value={values.vehicleId}
        onChange={update("vehicleId")}
        error={errors.vehicleId}
        hint="Pega el ID (UUID) del vehículo"
        autoComplete="off"
        spellCheck={false}
      />

      {values.type === "pregunta" && (
        <TextareaField
          label="Detalles de la pregunta (opcional)"
          rows={4}
          value={values.questionDetails}
          onChange={update("questionDetails")}
        />
      )}

      {values.type === "evento" && (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <FormField
            label="Fecha del evento"
            type="date"
            value={values.eventDate}
            onChange={update("eventDate")}
            className="sm:col-span-2"
          />
          <FormField label="Ciudad" autoComplete="off" value={values.eventCity} onChange={update("eventCity")} />
          <FormField label="Lugar" autoComplete="off" value={values.eventLocation} onChange={update("eventLocation")} />
        </div>
      )}

      {errorMessage && (
        <Alert variant="error" className="mt-2">
          {errorMessage}
        </Alert>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting} className="whitespace-nowrap">
          {submitLabel}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="whitespace-nowrap"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
