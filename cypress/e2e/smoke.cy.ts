import { loginAs } from "../support/auth";

// Prueba de humo: la app arranca, habla con la API y la sesión guardada sirve.
describe("Prueba de humo", () => {
  it("la página de inicio de sesión carga", () => {
    cy.visit("/login");
    cy.contains("h1, h2", "Iniciar sesión").should("be.visible");
  });

  it("con sesión muestra el listado de eventos", () => {
    loginAs("aficionado");
    cy.visit("/events");
    cy.contains("h1", "Eventos").should("be.visible");
    // El listado llega de la API: hay al menos una tarjeta o el mensaje de lista vacía.
    cy.get("body").should(($body) => {
      const hasCards = $body.find("article").length > 0;
      expect(hasCards || $body.text().includes("No hay eventos")).to.eq(true);
    });
  });
});
