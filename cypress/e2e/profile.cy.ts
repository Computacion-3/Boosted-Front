import { apiLogin, getMyProfile, updateMyProfile, type ApiProfile, type ApiSession } from "../support/api";
import { getAccount } from "../support/accounts";
import { loginAs, waitForHydration } from "../support/auth";

// Perfil (#15): ver y editar el perfil propio en /profile, con validación visual campo por campo y
// el 409 del backend cuando el nombre de usuario ya existe. Al terminar, el perfil del aficionado
// vuelve a quedar como estaba (se guarda al empezar y se restaura por la API).
describe("Perfil", () => {
  let fan: ApiSession;
  let original: ApiProfile;
  let takenUsername: string;

  /** Abre /profile y pasa al formulario de edición. */
  function openEditForm() {
    cy.visit("/profile");
    cy.contains("button", "Editar perfil").should("be.visible");
    // El botón y los campos son de React: si se usan antes de hidratar, no responden.
    waitForHydration("main button");
    cy.contains("button", "Editar perfil").click();
    cy.contains("h1", "Editar perfil").should("be.visible");
  }

  const field = (label: string) => cy.contains("label", label).invoke("attr", "for").then((id) => cy.get(`#${id}`));

  before(() => {
    getAccount("aficionado").then((credentials) =>
      apiLogin(credentials).then((session) => {
        fan = session;
        getMyProfile(session.token).then((profile) => (original = profile));
      }),
    );
    // Un nombre de usuario que ya existe: el del moderador.
    getAccount("moderador").then((credentials) =>
      apiLogin(credentials).then((session) =>
        getMyProfile(session.token).then((profile) => (takenUsername = profile.username)),
      ),
    );
  });

  after(() => {
    if (original) updateMyProfile(fan.token, original);
  });

  beforeEach(() => loginAs("aficionado"));

  it("muestra el perfil de la sesión", () => {
    cy.visit("/profile");
    cy.contains("h1", original.name).should("be.visible");
    cy.contains(`@${original.username}`).should("be.visible");
    cy.contains("Aficionado").should("be.visible");
    cy.contains("Miembro desde").should("be.visible");
  });

  it("marca los campos inválidos y no envía el formulario", () => {
    openEditForm();
    field("Nombre de usuario").clear().type("mal usuario");
    field("Foto de perfil (URL)").clear().type("no-es-url");
    cy.contains("button", "Guardar cambios").click();

    cy.contains("Solo letras, números y guion bajo").should("be.visible");
    cy.contains("Debe ser una URL que empiece por http:// o https://").should("be.visible");
    field("Nombre de usuario").should("have.attr", "aria-invalid", "true");
    // Sigue en el formulario: no se guardó nada.
    cy.contains("h1", "Editar perfil").should("be.visible");
  });

  it("avisa cuando el nombre de usuario ya está en uso (409)", () => {
    openEditForm();
    field("Nombre de usuario").clear().type(takenUsername);
    cy.contains("button", "Guardar cambios").click();
    cy.contains("Ese nombre de usuario ya está en uso").should("be.visible");
  });

  it("guarda la biografía y la ciudad", () => {
    const bio = `Biografía E2E ${Date.now()}`;
    openEditForm();
    field("Biografía").clear().type(bio);
    field("Ciudad").clear().type("Cali");
    cy.contains("button", "Guardar cambios").click();

    cy.contains("Perfil actualizado").should("be.visible");
    cy.contains(bio).should("be.visible");
    cy.contains("Cali").should("be.visible");
    getMyProfile(fan.token).its("bio").should("eq", bio);
  });

  it("borra la biografía al dejarla vacía", () => {
    openEditForm();
    field("Biografía").clear();
    cy.contains("button", "Guardar cambios").click();

    cy.contains("Aún no has escrito una biografía").should("be.visible");
    getMyProfile(fan.token).its("bio").should("eq", null);
  });
});
