import { z } from "zod";

/**
 * Reglas del formulario de registro, iguales a las del backend (CreateUserDto).
 * Las usan el RegisterForm (errores bajo cada campo) y registerAction (que
 * vuelve a validar porque una Server Action es un endpoint público).
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ingresa tu nombre")
      .max(100, "El nombre no puede superar 100 caracteres"),
    username: z
      .string()
      .trim()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(30, "El usuario no puede superar 30 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guion bajo (_)"),
    email: z.email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar 72 caracteres"),
    confirmPassword: z.string().min(1, "Repite la contraseña"),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    bio: z.string().trim().max(500, "La biografía no puede superar 500 caracteres").optional(),
  })
  // La confirmación es una regla del formulario: el error sale debajo de ese campo.
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterFormValues = z.input<typeof registerSchema>;

/** Errores por campo, listos para pasarlos a cada FormField. */
export type RegisterFieldErrors = Partial<Record<keyof RegisterFormValues, string>>;

/** Valida los valores y devuelve el primer error de cada campo (vacío si todo está bien). */
export function getRegisterFieldErrors(values: RegisterFormValues): RegisterFieldErrors {
  const result = registerSchema.safeParse(values);
  if (result.success) return {};

  const errors: RegisterFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegisterFormValues;
    errors[field] ??= issue.message;
  }
  return errors;
}
