import { z } from "zod";

/**
 * Reglas del formulario de login. Las usan el LoginForm (errores bajo cada
 * campo, sin esperar al servidor) y loginAction (que vuelve a validar porque una
 * Server Action es un endpoint público y alguien podría llamarla sin el formulario).
 */
export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Errores por campo, listos para pasarlos a cada FormField. */
export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

/** Valida los valores y devuelve el primer error de cada campo (vacío si todo está bien). */
export function getLoginFieldErrors(values: LoginFormValues): LoginFieldErrors {
  const result = loginSchema.safeParse(values);
  if (result.success) return {};

  const errors: LoginFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LoginFormValues;
    errors[field] ??= issue.message;
  }
  return errors;
}
