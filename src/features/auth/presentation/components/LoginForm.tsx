"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alert, Button, FormField } from "@/src/core/components/ui";
import {
  getLoginFieldErrors,
  type LoginFieldErrors,
  type LoginFormValues,
} from "../schemas/login.schema";

export type LoginFormProps = {
  /** Envía los datos; devuelve true si el login salió bien. */
  onSubmit: (values: LoginFormValues) => Promise<boolean>;
  isLoading: boolean;
  /** Error del servidor (credenciales inválidas, cuenta desactivada…). */
  errorMessage: string | null;
  onDismissError?: () => void;
};

/** Formulario de inicio de sesión. Recibe todo por props: no conoce Redux ni la red. */
export function LoginForm({ onSubmit, isLoading, errorMessage, onDismissError }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const updateField = (field: keyof LoginFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // El error de un campo se borra en cuanto la persona lo corrige.
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Primero se valida aquí para mostrar los errores sin esperar al servidor.
    const errors = getLoginFieldErrors(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      {errorMessage && (
        <Alert variant="error" onDismiss={onDismissError}>
          {errorMessage}
        </Alert>
      )}

      <FormField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={(event) => updateField("email", event.target.value)}
        error={fieldErrors.email}
      />

      <FormField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        value={values.password}
        onChange={(event) => updateField("password", event.target.value)}
        error={fieldErrors.password}
      />

      <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
        Entrar
      </Button>

      <p className="text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="link link-primary">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
