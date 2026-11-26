"use client";

import { useId } from "react";

/**
 * Ids y atributos de accesibilidad que comparten FormField, SelectField y TextareaField:
 * el control queda unido a su etiqueta (htmlFor), a su ayuda y a su error (aria-describedby),
 * y anuncia que es inválido (aria-invalid) cuando hay error.
 */
export function useFieldA11y(id: string | undefined, error?: string, hint?: string) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ");

  return {
    controlId,
    errorId,
    hintId,
    controlProps: {
      id: controlId,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy || undefined,
    },
  };
}

type FieldFeedbackProps = {
  hint?: string;
  hintId: string;
  error?: string;
  errorId: string;
};

/** Texto de ayuda y mensaje de error debajo del control. */
export function FieldFeedback({ hint, hintId, error, errorId }: FieldFeedbackProps) {
  return (
    <>
      {hint && (
        <p id={hintId} className="label">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
