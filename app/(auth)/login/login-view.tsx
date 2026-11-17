"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/src/features/auth/presentation/components/LoginForm";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import type { LoginFormValues } from "@/src/features/auth/presentation/schemas/login.schema";
import { HOME_ROUTE } from "@/src/lib/routes";

export function LoginView() {
  const router = useRouter();
  const { login, isLoading, errorMessage, clearError } = useAuth();

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
    />
  );
}
