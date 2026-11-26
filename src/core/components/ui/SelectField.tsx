"use client";

import type { SelectHTMLAttributes } from "react";
import { classNames } from "./class-names";
import { FieldFeedback, useFieldA11y } from "./field-a11y";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  /** Primera opción vacía, por ejemplo "Todos los tipos" en un filtro. */
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function SelectField({
  label,
  options,
  placeholder,
  error,
  hint,
  id,
  className,
  ...selectProps
}: SelectFieldProps) {
  const { controlProps, errorId, hintId } = useFieldA11y(id, error, hint);

  return (
    <div className={classNames("fieldset", className)}>
      <label htmlFor={controlProps.id} className="fieldset-legend">
        {label}
        {selectProps.required && <span className="text-error"> *</span>}
      </label>
      <select
        className={classNames("select w-full", error && "select-error")}
        {...controlProps}
        {...selectProps}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldFeedback hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
