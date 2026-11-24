// Espera a que React haya hidratado el elemento antes de interactuar con él.
//
// Next manda el HTML ya pintado y React lo "toma" un momento después (hidratación).
// Si Cypress escribe antes, React reinicia los campos controlados a su estado inicial
// y lo escrito se pierde. Una persona nunca es tan rápida; la prueba sí.
// React marca cada nodo hidratado con una propiedad interna `__reactFiber$…`.
export function waitForHydration(selector = "form"): void {
  cy.get(selector, { timeout: 30_000 }).should(($element) => {
    const isHydrated = Object.keys($element[0]).some((key) => key.startsWith("__reactFiber"));
    expect(isHydrated, `${selector} hidratado por React`).to.equal(true);
  });
}
