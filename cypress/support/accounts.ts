import type { Credentials } from "./api";

// Cuentas de prueba, una por rol. Las credenciales NO van en el repo: se leen de `.env.local`
// (E2E_*, ver .env.example), de `cypress.env.json` o de variables `CYPRESS_*`.
export type E2ERole = "aficionado" | "moderador" | "administrador";

const PREFIX: Record<E2ERole, string> = {
  aficionado: "AFICIONADO",
  moderador: "MODERADOR",
  administrador: "ADMIN",
};

/** Credenciales de la cuenta de un rol. Falla con un mensaje claro si faltan. */
export function getAccount(role: E2ERole): Cypress.Chainable<Credentials> {
  const emailKey = `${PREFIX[role]}_EMAIL`;
  const passwordKey = `${PREFIX[role]}_PASSWORD`;
  return cy.env([emailKey, passwordKey]).then((env) => {
    const email = env[emailKey] as string | undefined;
    const password = env[passwordKey] as string | undefined;
    if (!email || !password) {
      throw new Error(
        `Faltan E2E_${PREFIX[role]}_EMAIL y E2E_${PREFIX[role]}_PASSWORD. Agrégalas a .env.local (mira .env.example).`,
      );
    }
    return { email, password };
  });
}
