"use client";

import type { TextareaHTMLAttributes } from "react";
import { classNames } from "./class-names";
import { FieldFeedback, useFieldA11y } from "./field-a11y";

export type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/** Área de texto (descripciones, bio) con el mismo manejo de errores que FormField. */
export function TextareaField({
  label,
  error,
  hint,
  id,
  className,
  ...textareaProps
}: TextareaFieldProps) {
  const { controlProps, errorId, hintId } = useFieldA11y(id, error, hint);

  return (
    <div className={classNames("fieldset", className)}>
      <label htmlFor={controlProps.id} className="fieldset-legend">
        {label}
        {textareaProps.required && <span className="text-error"> *</span>}
      </label>
      <textarea
        className={classNames("textarea w-full", error && "textarea-error")}
        {...controlProps}
        {...textareaProps}
      />
      <FieldFeedback hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
