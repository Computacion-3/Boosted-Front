import { loginAs } from "../support/auth";

// Control de acceso (#32): cada rol ve y puede hacer solo lo suyo.
// Aficionado: sin permisos. Moderador: posts:moderate. Administrador: todos, incluido users:read
// para entrar a /admin/users.
//
// Ojo: estas pruebas revisan la interfaz. Quien protege de verdad es el backend (403) y, en el
// front, el DAL de cada página y cada Server Action.

/** Abre el detalle de la primera publicación del feed. */
function openFirstPost() {
  cy.visit("/posts");
  cy.get('article a[href^="/posts/"]').first().should("be.visible").click();
  cy.location("pathname").should("match", /^\/posts\/[^/]+$/);
  cy.get("h1").should("be.visible");
}

/** El aviso 403 que muestra una página cuando falta el permiso. */
function expectAccessDenied() {
  cy.contains("Error 403").should("be.visible");
  cy.contains("h1, h2, h3", "No tienes acceso").should("be.visible");
}

const moderationHeading = () => cy.contains("h1, h2, h3, h4", "Moderación");
const moderationButton = () => cy.contains("button", /Ocultar publicación|Restaurar publicación/);

describe("Control de acceso", () => {
  describe("sin sesión", () => {
    for (const route of ["/events", "/posts", "/admin/users"]) {
      it(`${route} redirige a /login`, () => {
        cy.visit(route);
        cy.location("pathname").should("eq", "/login");
        cy.contains("h1, h2", "Iniciar sesión").should("be.visible");
      });
    }
  });

  describe("aficionado", () => {
    beforeEach(() => loginAs("aficionado"));

    it("no ve los enlaces de administración", () => {
      cy.visit("/events");
      cy.contains("a:visible", "Eventos").should("exist");
      cy.contains("a", "Usuarios").should("not.exist");
      cy.contains("a", "Roles").should("not.exist");
    });

    it("no ve las acciones de moderación de una publicación", () => {
      openFirstPost();
      moderationHeading().should("not.exist");
      moderationButton().should("not.exist");
    });

    it("en /admin/users ve el mensaje 403", () => {
      cy.visit("/admin/users");
      expectAccessDenied();
      cy.contains("h1, h2, h3", "Usuarios").should("not.exist");
    });

    it("en /admin/roles ve el mensaje 403", () => {
      cy.visit("/admin/roles");
      expectAccessDenied();
    });
  });

  describe("moderador", () => {
    beforeEach(() => loginAs("moderador"));

    it("ve las acciones de moderación de una publicación", () => {
      openFirstPost();
      moderationHeading().should("be.visible");
      moderationButton().should("be.visible");
    });

    it("no entra a la gestión de usuarios", () => {
      cy.visit("/admin/users");
      expectAccessDenied();
    });
  });

  describe("administrador", () => {
    beforeEach(() => loginAs("administrador"));

    it("entra a la gestión de usuarios desde el menú", () => {
      cy.visit("/events");
      cy.contains("a:visible", "Usuarios").click();
      cy.location("pathname").should("eq", "/admin/users");
      cy.contains("h1", "Usuarios").should("be.visible");
      cy.contains("Error 403").should("not.exist");
      // La tabla carga las cuentas desde la API.
      cy.get("table").should("be.visible");
    });
  });
});
