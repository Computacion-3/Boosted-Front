import { apiLogin, apiRequest } from "../support/api";
import { getAccount, type E2ERole } from "../support/accounts";
import { loginAs, waitForHydration } from "../support/auth";

type Vehicle = { id: string; brand: string; model: string };
const button = (text: string) => cy.contains("button", text);
const field = (name: string) => cy.get(`form [name="${name}"]`);
const save = () => { button("Guardar").click(); cy.get('form [name="brand"], form [name="name"], form [name="title"]').should("not.exist"); };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

describe("Garaje (#16–#21)", () => {
  let brand: string;
  let owner: E2ERole;
  let otherId: string;
  beforeEach(() => { brand = `E2E-${Date.now()}-${Cypress._.random(1000, 9999)}`; owner = "aficionado"; otherId = ""; });
  afterEach(() => {
    // Solo borra registros con la marca única creada por esta prueba, incluso si falla la UI.
    getAccount(owner).then(credentials => apiLogin(credentials)).then(({ token }) => {
      apiRequest<Vehicle[]>("GET", "/vehicles/me", token).then(({ body }) => {
        for (const v of body.filter(v => v.brand === brand)) apiRequest("DELETE", `/vehicles/${v.id}`, token);
      });
    });
  });
  it("crea, busca, edita, registra modificaciones y bitácora, calcula gastos y elimina", () => {
    loginAs("aficionado");
    cy.visit("/garage"); waitForHydration('[aria-label="Buscar vehículos"]');
    button("Nuevo vehículo").click();
    field("brand").type(brand); field("model").type("M3"); field("year").type("2020"); field("visibility").select("public"); save();
    cy.get('[aria-label="Buscar vehículos"]').type(brand);
    cy.contains("a", `${brand} M3`).click();
    cy.contains("h1", `${brand} M3 2020`).should("be.visible");
    button("Editar vehículo").click(); field("color").type("Azul"); save();
    cy.contains("dd", "Azul").should("be.visible");
    button("Modificaciones").click(); button("Nueva modificación").click();
    field("name").type("Escape E2E"); field("category").type("Escape"); field("partCost").type("100000"); field("installationCost").type("20000"); save();
    cy.contains("article", "Escape E2E").within(() => { button("Editar").click(); });
    field("status").select("installed"); save();
    cy.contains("article", "Escape E2E").should("contain.text", "Instalada");
    button("Bitácora").click(); button("Nueva entrada").click();
    field("title").type("Compra E2E"); field("content").type("Gasto independiente"); field("type").select("purchase"); field("entryDate").type("2026-11-20"); field("expense").clear().type("30000"); save();
    cy.contains("article", "Compra E2E").within(() => { button("Editar").click(); });
    field("expense").clear().type("40000"); save();
    cy.contains("article", "Compra E2E").should("contain.text", "Gasto:");
    button("Inversión").click();
    cy.contains("h2", "Total invertido").parent().find("strong").should("have.text", money(160000));
    cy.contains("h2", "Presupuesto planeado").parent().find("strong").should("have.text", money(0));
    button("Bitácora").click(); cy.contains("article", "Compra E2E").within(() => button("Eliminar").click()); button("Confirmar").click(); cy.contains("article", "Compra E2E").should("not.exist");
    button("Modificaciones").click(); cy.contains("article", "Escape E2E").within(() => button("Eliminar").click()); button("Confirmar").click(); cy.contains("article", "Escape E2E").should("not.exist");
    button("Eliminar vehículo").click(); button("Confirmar").click(); cy.location("pathname").should("eq", "/garage");
    cy.get('[aria-label="Buscar vehículos"]').clear().type(brand); cy.contains("No hay vehículos para esta búsqueda.").should("be.visible");
  });
  it("muestra vehículos públicos ajenos sin permitir editar ni eliminar", () => {
    owner = "moderador";
    getAccount(owner).then(credentials => apiLogin(credentials)).then(({ token }) =>
      apiRequest<Vehicle>("POST", "/vehicles", token, { brand, model: "Ajeno", year: 2020, visibility: "public" }).then(({ body }) => { otherId = body.id; })
    );
    loginAs("aficionado"); cy.visit("/garage"); waitForHydration('[aria-label="Buscar vehículos"]'); button("Vehículos públicos").click();
    cy.get('[aria-label="Buscar vehículos"]').type(brand); cy.contains("a", `${brand} Ajeno`).click();
    cy.contains("h1", `${brand} Ajeno`).should("be.visible"); button("Editar vehículo").should("not.exist"); button("Eliminar vehículo").should("not.exist"); button("Inversión").should("not.exist");
    button("Modificaciones").click(); button("Nueva modificación").should("not.exist"); button("Bitácora").click(); button("Nueva entrada").should("not.exist");
    getAccount("aficionado").then(credentials => apiLogin(credentials)).then(({ token }) =>
      apiRequest("PATCH", `/vehicles/${otherId}`, token, { color: "Rojo" }, false).its("status").should("eq", 403)
    );
  });
});
