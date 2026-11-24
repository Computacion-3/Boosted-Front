import type { Credentials } from "./api";

// Inicia sesión como lo haría una persona: por el formulario. Así la cookie `session` (httpOnly) la
// pone la propia Server Action del front. `cy.session` guarda esa cookie y la restaura en las
// pruebas siguientes sin repetir el formulario.
export function loginThroughUi({ email, password }: Credentials): void {
  cy.session(
    ["ui", email],
    () => {
      cy.visit("/login");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password, { log: false });
      cy.contains("button", "Entrar").click();
      cy.location("pathname", { timeout: 30_000 }).should("not.eq", "/login");
      cy.getCookie("session").should("exist");
    },
    { cacheAcrossSpecs: false },
  );
}
