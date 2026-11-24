import { defineConfig, devices } from "@playwright/test";
import { STORAGE_STATE } from "./e2e/support/accounts";

/*
 * Pruebas end-to-end con Playwright.
 *
 * Playwright no lee .env.local como Next: se carga aquí para tener las credenciales
 * E2E_* y, si existe, E2E_API_URL. En CI no hay archivo y las variables llegan del entorno.
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local: se usan las variables del entorno.
}

const baseURL = process.env.E2E_BASE_URL || "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  // Las pruebas comparten la base de datos de la API: en serie se evitan choques entre ellas.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "es-CO",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // 1. Inicia sesión una vez por cuenta y guarda las cookies (storageState).
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    // 2. Las pruebas arrancan ya con la sesión del aficionado (se puede cambiar por archivo).
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE.aficionado },
      dependencies: ["setup"],
    },
  ],
  // Levanta el front si no está corriendo. Con E2E_API_URL, ese servidor apunta a una API
  // de pruebas en vez de la de .env.local (si el front ya estaba corriendo, no aplica).
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: process.env.E2E_API_URL ? { API_URL: process.env.E2E_API_URL } : {},
  },
});
