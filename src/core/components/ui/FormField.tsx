"use client";

import type { InputHTMLAttributes } from "react";
import { classNames } from "./class-names";
import { FieldFeedback, useFieldA11y } from "./field-a11y";

export type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Mensaje de validación. Si existe, el campo se pinta en rojo y se anuncia como inválido. */
  error?: string;
  hint?: string;
};

/** Campo de texto con etiqueta, ayuda y error visual accesible. */
export function FormField({ label, error, hint, id, className, ...inputProps }: FormFieldProps) {
  const { controlProps, errorId, hintId } = useFieldA11y(id, error, hint);

  return (
    <div className={classNames("fieldset", className)}>
      <label htmlFor={controlProps.id} className="fieldset-legend">
        {label}
        {inputProps.required && <span className="text-error"> *</span>}
      </label>
      <input
        className={classNames("input w-full", error && "input-error")}
        {...controlProps}
        {...inputProps}
      />
      <FieldFeedback hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
