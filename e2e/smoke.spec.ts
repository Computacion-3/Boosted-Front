import { expect, test } from "@playwright/test";

/** Prueba de humo: la app arranca, habla con la API y la sesión guardada sirve. */

test.describe("sin sesión", () => {
  // Contexto vacío: sin las cookies del setup.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("la página de inicio de sesión carga", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });
});

test.describe("con sesión", () => {
  test("muestra el listado de eventos", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Eventos", level: 1 })).toBeVisible();
    // El listado llega de la API: hay al menos una tarjeta o el mensaje de lista vacía.
    await expect(page.locator("article").or(page.getByText("No hay eventos")).first()).toBeVisible();
  });
});
