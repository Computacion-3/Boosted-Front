// E2E del flujo de autenticación (#31): registro, login, recarga y logout.
//
// La prueba crea su propia cuenta con un correo único en cada corrida, así que no
// necesita credenciales guardadas ni depende de los datos del seed. Todo pasa por
// la interfaz, como lo haría una persona.

import { waitForHydration } from "../support/hydration";

const PASSWORD = "Boosted123";

/** Datos de una cuenta nueva y única para esta corrida. */
function newAccount() {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: "Prueba E2E",
    username: `e2e_${id}`,
    email: `e2e_${id}@boosted.test`,
    password: PASSWORD,
  };
}

type Account = ReturnType<typeof newAccount>;

function fillRegisterForm(account: Account, confirmPassword = account.password) {
  waitForHydration();
  cy.get("form").within(() => {
    cy.contains("label", "Nombre").next("input").clear().type(account.name);
    cy.contains("label", "Usuario").next("input").clear().type(account.username);
    cy.contains("label", "Correo electrónico").next("input").clear().type(account.email);
    cy.contains("label", /^Contraseña/).next("input").clear().type(account.password, { log: false });
    cy.contains("label", "Confirmar contraseña").next("input").clear().type(confirmPassword, { log: false });
  });
}

function fillLoginForm(email: string, password: string) {
  waitForHydration();
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password, { log: false });
  cy.contains("button", "Entrar").click();
}

describe("Autenticación", () => {
  // Una sola cuenta para todo el archivo: las pruebas siguen el orden de una persona real
  // (se registra, entra, recarga y sale).
  const account = newAccount();

  it("registro con datos inválidos: muestra los errores bajo cada campo sin enviar nada", () => {
    cy.visit("/register");
    waitForHydration();

    // Formulario vacío.
    cy.contains("button", "Crear cuenta").click();
    cy.contains("Ingresa tu nombre").should("be.visible");
    cy.contains("Ingresa un correo válido").should("be.visible");
    cy.location("pathname").should("eq", "/register");

    // Usuario con espacio, contraseña corta y confirmación distinta.
    fillRegisterForm({ ...account, username: "con espacio", password: "corta" }, "otra");
    cy.contains("button", "Crear cuenta").click();
    cy.contains("Solo letras, números y guion bajo (_)").should("be.visible");
    cy.contains("La contraseña debe tener al menos 8 caracteres").should("be.visible");
    cy.contains("Las contraseñas no coinciden").should("be.visible");
    cy.get(".input-error").should("have.length.at.least", 2);
    cy.location("pathname").should("eq", "/register");
  });

  it("registro válido: crea la cuenta y lleva a /login con el aviso", () => {
    cy.visit("/register");
    fillRegisterForm(account);
    cy.contains("button", "Crear cuenta").click();

    cy.location("pathname", { timeout: 30_000 }).should("eq", "/login");
    cy.location("search").should("eq", "?registered=1");
    cy.contains("Tu cuenta quedó creada").should("be.visible");
  });

  it("registro con un correo que ya existe: muestra el mensaje de la API (409)", () => {
    cy.visit("/register");
    fillRegisterForm({ ...account, username: `${account.username}_2` });
    cy.contains("button", "Crear cuenta").click();

    cy.contains("El correo ya está registrado", { timeout: 30_000 }).should("be.visible");
    cy.location("pathname").should("eq", "/register");
  });

  it("login con credenciales incorrectas: muestra «Credenciales inválidas» y no crea sesión", () => {
    cy.visit("/login");
    fillLoginForm(account.email, "ContraseñaEquivocada1");

    cy.contains("Credenciales inválidas", { timeout: 30_000 }).should("be.visible");
    cy.location("pathname").should("eq", "/login");
    cy.getCookie("session").should("not.exist");
  });

  it("login correcto, recarga y logout: la sesión vive en una cookie httpOnly y se borra al salir", () => {
    cy.visit("/login");
    fillLoginForm(account.email, account.password);

    // Entra a la home privada con la cookie httpOnly (JavaScript de la página no la puede leer).
    cy.location("pathname", { timeout: 30_000 }).should("not.eq", "/login");
    cy.getCookie("session").should("exist").its("httpOnly").should("eq", true);
    cy.get(`button[aria-label="Menú de ${account.name}"]`).should("be.visible");

    // Recargar mantiene la sesión: el Header sigue mostrando a la persona.
    cy.reload();
    cy.get(`button[aria-label="Menú de ${account.name}"]`, { timeout: 30_000 }).should("be.visible");
    cy.getCookie("session").should("exist");

    // Con sesión, /login devuelve a la home privada.
    cy.visit("/login");
    cy.location("pathname", { timeout: 30_000 }).should("not.eq", "/login");

    // Logout desde el menú de usuario (el botón tiene que estar hidratado para abrir el menú).
    const userMenu = `button[aria-label="Menú de ${account.name}"]`;
    waitForHydration(userMenu);
    cy.get(userMenu).click();
    cy.contains("button", "Cerrar sesión").click();
    cy.location("pathname", { timeout: 30_000 }).should("eq", "/");
    cy.getCookie("session").should("not.exist");

    // Sin sesión, una ruta protegida vuelve a pedir login.
    cy.visit("/events");
    cy.location("pathname", { timeout: 30_000 }).should("eq", "/login");
  });
});
