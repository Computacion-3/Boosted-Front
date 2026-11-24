import { getAccount, type E2ERole } from "./accounts";
import type { Credentials } from "./api";

// Los campos del formulario son controlados por React: si se teclea antes de que la página se
// hidrate, React vuelve a dejarlos vacíos y el envío falla la validación. React marca cada nodo con
// `__reactProps$…` al hidratarlo, así que se espera a esa marca antes de escribir.
function waitForHydration(selector: string): void {
  cy.get(selector).should(($element) => {
    const hydrated = Object.keys($element[0]).some((key) => key.startsWith("__reactProps$"));
    expect(hydrated, "la página terminó de hidratarse").to.eq(true);
  });
}

// Inicia sesión como lo haría una persona: por el formulario. Así la cookie `session` (httpOnly) la
// pone la propia Server Action del front. `cy.session` guarda esa cookie y la restaura en las
// pruebas siguientes sin repetir el formulario.
export function loginThroughUi({ email, password }: Credentials): void {
  cy.session(
    ["ui", email],
    () => {
      cy.visit("/login");
      waitForHydration("form");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password, { log: false });
      cy.contains("button", "Entrar").click();
      cy.location("pathname", { timeout: 30_000 }).should("not.eq", "/login");
      cy.getCookie("session").should("exist");
    },
    { cacheAcrossSpecs: false },
  );
}

/** Abre la sesión de la cuenta de prueba de un rol. */
export function loginAs(role: E2ERole): void {
  getAccount(role).then(loginThroughUi);
}
