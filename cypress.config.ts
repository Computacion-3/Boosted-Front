import { defineConfig } from "cypress";

// Dirección de la API (Boosted). La prueba habla con ella directamente para preparar datos y para
// actuar como "la otra persona" (dar like, comentar). El front, en cambio, usa su propio `API_URL`.
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:3000";

export default defineConfig({
  // Valores públicos de la configuración; se leen con `Cypress.expose("apiUrl")`.
  // Las credenciales NO van aquí: son secretos y se leen con `cy.env([...])`.
  expose: { apiUrl },
  e2e: {
    // Con `CYPRESS_BASE_URL` se apunta a otra dirección (por ejemplo, el despliegue en Vercel).
    baseUrl: "http://localhost:3001",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    video: false,
    // La app hace viajes reales a la API (en Render el primer arranque en frío tarda ~1 minuto).
    defaultCommandTimeout: 10_000,
    retries: { runMode: 1, openMode: 0 },
  },
});
