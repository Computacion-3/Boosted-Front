"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, TextareaField } from "@/src/core/components/ui";
import {
  getRegisterFieldErrors,
  type RegisterFieldErrors,
  type RegisterFormValues,
} from "../schemas/register.schema";

export type RegisterFormProps = {
  /** Envía los datos; devuelve true si la cuenta se creó. */
  onSubmit: (values: RegisterFormValues) => Promise<boolean>;
  isLoading: boolean;
  /** Error del servidor (correo o usuario repetido, datos inválidos…). */
  errorMessage: string | null;
  onDismissError?: () => void;
};

const EMPTY_VALUES: Required<RegisterFormValues> = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  country: "",
  bio: "",
};

/** Formulario de registro. Recibe todo por props: no conoce Redux ni la red. */
export function RegisterForm({ onSubmit, isLoading, errorMessage, onDismissError }: RegisterFormProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const updateField = (field: keyof RegisterFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // El error de un campo se borra en cuanto la persona lo corrige.
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  // Atajo para no repetir value/onChange/error en cada campo.
  const bind = (field: keyof RegisterFormValues) => ({
    value: values[field],
    onChange: (event: { target: { value: string } }) => updateField(field, event.target.value),
    error: fieldErrors[field],
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Primero se valida aquí para mostrar los errores sin esperar al servidor.
    const errors = getRegisterFieldErrors(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>

      <FormField label="Nombre" autoComplete="name" required {...bind("name")} />
      <FormField
        label="Usuario"
        autoComplete="username"
        required
        hint="De 3 a 30 caracteres: letras, números y _"
        {...bind("username")}
      />
      <FormField label="Correo electrónico" type="email" autoComplete="email" required {...bind("email")} />
      <FormField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        required
        hint="De 8 a 72 caracteres"
        {...bind("password")}
      />
      <FormField
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        required
        {...bind("confirmPassword")}
      />

      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormField label="Ciudad" autoComplete="address-level2" {...bind("city")} />
        <FormField label="País" autoComplete="country-name" {...bind("country")} />
      </div>
      <TextareaField label="Biografía" rows={3} hint="Opcional, hasta 500 caracteres" {...bind("bio")} />

      {/*
        El error del servidor (correo o usuario repetido…) va junto al botón y no arriba: el formulario
        es largo y, tras enviar, la pantalla queda al final; arriba el aviso quedaría fuera de la vista.
      */}
      {errorMessage && (
        <Alert variant="error" onDismiss={onDismissError} className="mt-2">
          {errorMessage}
        </Alert>
      )}

      <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
        Crear cuenta
      </Button>

      <p className="text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="link link-primary">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
