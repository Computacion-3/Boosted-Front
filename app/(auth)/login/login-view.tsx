"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/src/features/auth/presentation/components/LoginForm";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import type { LoginFormValues } from "@/src/features/auth/presentation/schemas/login.schema";
import { HOME_ROUTE } from "@/src/lib/routes";

export function LoginView({ justRegistered = false }: { justRegistered?: boolean }) {
  const router = useRouter();
  const { login, isLoading, errorMessage, clearError } = useAuth();

  // El error vive en el store y el store sobrevive a la navegación entre /login y /register:
  // sin esto, el error del otro formulario aparecería aquí sin haber enviado nada.
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (values: LoginFormValues) => {
    const ok = await login(values);
    if (ok) {
      router.replace(HOME_ROUTE);
      // Vuelve a pedir los Server Components: el layout de (app) lee la cookie
      // recién creada y el Header ya muestra a la persona con sesión.
      router.refresh();
    }
    return ok;
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onDismissError={clearError}
      notice={justRegistered ? "Tu cuenta quedó creada. Ya puedes iniciar sesión." : undefined}
    />
  );
}
