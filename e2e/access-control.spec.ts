import { expect, test, type Page } from "@playwright/test";
import { STORAGE_STATE } from "./support/accounts";

/*
 * Control de acceso (#32): cada rol ve y puede hacer solo lo suyo.
 * Por defecto (aficionado): sin permisos. Moderador: posts:moderate.
 * Administrador: todos, incluido users:read para entrar a /admin/users.
 *
 * Ojo: estas pruebas revisan la interfaz. Quien protege de verdad es el backend (403)
 * y, en el front, el DAL de cada página y cada Server Action.
 */

/** Abre el detalle de la primera publicación del feed. */
async function openFirstPost(page: Page) {
  await page.goto("/posts");
  const firstPost = page.locator('article a[href^="/posts/"]').first();
  await expect(firstPost).toBeVisible();
  await firstPost.click();
  await expect(page).toHaveURL(/\/posts\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

/** El aviso 403 que muestra una página cuando falta el permiso. */
async function expectAccessDenied(page: Page) {
  await expect(page.getByText("Error 403")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No tienes acceso" })).toBeVisible();
}

const mainNav = (page: Page) => page.getByRole("navigation").first();

test.describe("sin sesión", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const route of ["/events", "/posts", "/admin/users"]) {
    test(`${route} redirige a /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    });
  }
});

test.describe("aficionado", () => {
  test.use({ storageState: STORAGE_STATE.aficionado });

  test("no ve los enlaces de administración", async ({ page }) => {
    await page.goto("/events");
    await expect(mainNav(page).getByRole("link", { name: "Eventos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Usuarios" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Roles" })).toHaveCount(0);
  });

  test("no ve las acciones de moderación de una publicación", async ({ page }) => {
    await openFirstPost(page);
    await expect(page.getByRole("heading", { name: "Moderación" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Ocultar publicación|Restaurar publicación/ })).toHaveCount(0);
  });

  test("en /admin/users ve el mensaje 403", async ({ page }) => {
    await page.goto("/admin/users");
    await expectAccessDenied(page);
    await expect(page.getByRole("heading", { name: "Usuarios" })).toHaveCount(0);
  });

  test("en /admin/roles ve el mensaje 403", async ({ page }) => {
    await page.goto("/admin/roles");
    await expectAccessDenied(page);
  });
});

test.describe("moderador", () => {
  test.use({ storageState: STORAGE_STATE.moderador });

  test("ve las acciones de moderación de una publicación", async ({ page }) => {
    await openFirstPost(page);
    await expect(page.getByRole("heading", { name: "Moderación" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ocultar publicación|Restaurar publicación/ })).toBeVisible();
  });

  test("no entra a la gestión de usuarios", async ({ page }) => {
    await page.goto("/admin/users");
    await expectAccessDenied(page);
  });
});

test.describe("administrador", () => {
  test.use({ storageState: STORAGE_STATE.administrador });

  test("entra a la gestión de usuarios desde el menú", async ({ page }) => {
    await page.goto("/events");
    await page.getByRole("link", { name: "Usuarios" }).first().click();
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole("heading", { name: "Usuarios", level: 1 })).toBeVisible();
    await expect(page.getByText("Error 403")).toHaveCount(0);
    // La tabla carga las cuentas desde la API.
    await expect(page.getByRole("table")).toBeVisible();
  });
});
