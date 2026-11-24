import { defineConfig } from "cypress";

/*
 * Pruebas end-to-end con Cypress.
 *
 * Cypress no lee .env.local como Next: se carga aquí para tener las credenciales E2E_* y, si
 * existen, E2E_BASE_URL y E2E_API_URL. En CI no hay archivo y las variables llegan del entorno.
 */
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local: se usan las variables del entorno.
}

// Dirección de la API (Boosted). La prueba habla con ella directamente para preparar datos y para
// actuar como "la otra persona" (dar like, comentar). El front, en cambio, usa su propio `API_URL`.
const apiUrl = process.env.E2E_API_URL || "http://localhost:3000";

// Credenciales de las tres cuentas de prueba (una por rol). Son secretos: no van en `expose` sino
// en `env`, y las pruebas las leen con `cy.env([...])`. Con `cypress.env.json` o variables
// `CYPRESS_AFICIONADO_EMAIL`, etc., también funcionan.
const secrets = {
  AFICIONADO_EMAIL: process.env.E2E_AFICIONADO_EMAIL,
  AFICIONADO_PASSWORD: process.env.E2E_AFICIONADO_PASSWORD,
  MODERADOR_EMAIL: process.env.E2E_MODERADOR_EMAIL,
  MODERADOR_PASSWORD: process.env.E2E_MODERADOR_PASSWORD,
  ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD,
};

export default defineConfig({
  // Valores públicos de la configuración; se leen con `Cypress.expose("apiUrl")`.
  expose: { apiUrl },
  env: Object.fromEntries(Object.entries(secrets).filter(([, value]) => value)),
  e2e: {
    // Con `E2E_BASE_URL` (o `CYPRESS_BASE_URL`) se apunta a otra dirección, por ejemplo Vercel.
    baseUrl: process.env.E2E_BASE_URL || "http://localhost:3001",
    // El menú de escritorio aparece desde 1024 px; el tamaño por defecto de Cypress (1000) lo esconde.
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    video: false,
    // La app hace viajes reales a la API (en Render el primer arranque en frío tarda ~1 minuto).
    defaultCommandTimeout: 10_000,
    retries: { runMode: 1, openMode: 0 },
  },
});
