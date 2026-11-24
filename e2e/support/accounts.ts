/*
 * Cuentas de prueba de E2E. Las credenciales NO van en el repo: se leen de variables
 * de entorno (.env.local en tu máquina, secretos en CI). Ver .env.example.
 */

export type E2ERole = "aficionado" | "moderador" | "administrador";

/** Roles con los que inicia sesión e2e/auth.setup.ts. */
export const E2E_ROLES: E2ERole[] = ["aficionado", "moderador", "administrador"];

/** Dónde se guarda la sesión de cada cuenta. La carpeta e2e/.auth está en .gitignore. */
export const STORAGE_STATE: Record<E2ERole, string> = {
  aficionado: "e2e/.auth/aficionado.json",
  moderador: "e2e/.auth/moderador.json",
  administrador: "e2e/.auth/administrador.json",
};

const ENV_PREFIX: Record<E2ERole, string> = {
  aficionado: "E2E_AFICIONADO",
  moderador: "E2E_MODERADOR",
  administrador: "E2E_ADMIN",
};

export interface E2EAccount {
  email: string;
  password: string;
}

/** Credenciales de la cuenta de un rol. Falla con un mensaje claro si faltan. */
export function getAccount(role: E2ERole): E2EAccount {
  const prefix = ENV_PREFIX[role];
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(
      `Faltan ${prefix}_EMAIL y ${prefix}_PASSWORD. Agrégalas a .env.local (mira .env.example).`,
    );
  }
  return { email, password };
}
