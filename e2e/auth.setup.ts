import { expect, test as setup } from "@playwright/test";
import { E2E_ROLES, getAccount, STORAGE_STATE } from "./support/accounts";

/*
 * Inicia sesión por la interfaz, como lo haría una persona, y guarda las cookies
 * (incluida la cookie httpOnly `session`) en e2e/.auth/<rol>.json. Las pruebas
 * reutilizan ese archivo y no tienen que volver a iniciar sesión cada vez.
 */
for (const role of E2E_ROLES) {
  setup(`iniciar sesión como ${role}`, async ({ page }) => {
    const { email, password } = getAccount(role);

    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    // Tras iniciar sesión, la app manda a /events.
    await expect(page).toHaveURL(/\/events/);
    await page.context().storageState({ path: STORAGE_STATE[role] });
  });
}
