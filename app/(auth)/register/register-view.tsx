"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/src/features/auth/presentation/components/RegisterForm";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import type { RegisterFormValues } from "@/src/features/auth/presentation/schemas/register.schema";
import { LOGIN_ROUTE } from "@/src/lib/routes";

export function RegisterView() {
  const router = useRouter();
  const { register, isLoading, errorMessage, clearError } = useAuth();

  const handleSubmit = async (values: RegisterFormValues) => {
    const ok = await register(values);
    if (ok) {
      // /login lee `registered=1` y muestra el aviso de cuenta creada.
      router.replace(`${LOGIN_ROUTE}?registered=1`);
    }
    return ok;
  };

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onDismissError={clearError}
    />
  );
}
