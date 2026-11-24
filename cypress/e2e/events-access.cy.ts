import { apiLogin, apiRequest, createEvent, deleteEvent, type ApiSession } from "../support/api";
import { getAccount } from "../support/accounts";
import { loginAs } from "../support/auth";

// Control de acceso en eventos (#28). El backend no tiene un permiso `events:*`: deja editar y
// eliminar un evento a quien lo creó, a un moderador o a un administrador. El front copia esa regla
// en `CommunityEvent.canBeModifiedBy()` (canEdit) solo para mostrar u ocultar los botones; la
// barrera real es la API, que responde 403.
//
// Dos eventos creados por la API antes de las pruebas y borrados al final:
//  - uno del MODERADOR, que para el aficionado es un evento ajeno;
//  - uno del AFICIONADO, que es suyo.
describe("Control de acceso en eventos", () => {
  let fan: ApiSession;
  let moderator: ApiSession;
  let othersEventId: string;
  let ownEventId: string;

  // `:visible` porque el modal de confirmación (un <dialog> cerrado con su propio botón
  // «Eliminar») siempre está en el DOM; lo que importa es lo que la persona ve.
  const editLink = () => cy.contains("a:visible", "Editar");
  const deleteButton = () => cy.contains("button:visible", "Eliminar");

  before(() => {
    getAccount("aficionado").then((credentials) => apiLogin(credentials).then((s) => (fan = s)));
    getAccount("moderador").then((credentials) => apiLogin(credentials).then((s) => (moderator = s)));
    cy.then(() => {
      createEvent(moderator.token, `E2E evento del moderador ${Date.now()}`).then(
        (event) => (othersEventId = event.id),
      );
      createEvent(fan.token, `E2E evento del aficionado ${Date.now()}`).then(
        (event) => (ownEventId = event.id),
      );
    });
  });

  after(() => {
    if (othersEventId) deleteEvent(moderator.token, othersEventId);
    if (ownEventId) deleteEvent(fan.token, ownEventId);
  });

  describe("aficionado", () => {
    beforeEach(() => loginAs("aficionado"));

    it("no ve Editar ni Eliminar en un evento ajeno", () => {
      cy.visit(`/events/${othersEventId}`);
      cy.contains("h1", "E2E evento del moderador").should("be.visible");
      editLink().should("not.exist");
      deleteButton().should("not.exist");
    });

    it("en /edit de un evento ajeno ve el aviso y no el formulario", () => {
      cy.visit(`/events/${othersEventId}/edit`);
      cy.contains("No puedes editar este evento").should("be.visible");
      cy.get("form").should("not.exist");
    });

    it("sí ve Editar y Eliminar en su propio evento", () => {
      cy.visit(`/events/${ownEventId}`);
      cy.contains("h1", "E2E evento del aficionado").should("be.visible");
      editLink().should("be.visible");
      deleteButton().should("be.visible");
    });
  });

  describe("moderador", () => {
    beforeEach(() => loginAs("moderador"));

    it("ve Editar y Eliminar en un evento de otra persona", () => {
      cy.visit(`/events/${ownEventId}`);
      cy.contains("h1", "E2E evento del aficionado").should("be.visible");
      editLink().should("be.visible");
      deleteButton().should("be.visible");
    });
  });

  it("la API rechaza con 403 que el aficionado edite un evento ajeno", () => {
    // Ocultar el botón no protege: aunque alguien llame directo, el backend decide.
    apiRequest("PATCH", `/events/${othersEventId}`, fan.token, { name: "Cambio no permitido" }, false)
      .its("status")
      .should("eq", 403);
  });
});
