// Llamadas directas a la API de Boosted. Las pruebas las usan para preparar datos y para hacer lo
// que haría "la otra persona" mientras el navegador mira la app. No pasan por el front.

export type Credentials = { email: string; password: string };

export type ApiSession = {
  token: string;
  name: string;
};

type ApiResult = Cypress.Chainable<Cypress.Response<unknown>>;

type LoginResponse ={ accessToken: string; user: { name: string; email: string } };

// En Render el primer arranque en frío tarda cerca de un minuto: la primera llamada espera más.
const API_TIMEOUT_MS = 90_000;

function apiUrl(path: string): string {
  return `${Cypress.expose("apiUrl") as string}${path}`;
}

export function apiLogin({ email, password }: Credentials): Cypress.Chainable<ApiSession> {
  return cy
    .request<LoginResponse>({
      method: "POST",
      url: apiUrl("/auth/login"),
      body: { email, password },
      timeout: API_TIMEOUT_MS,
      log: false, // el cuerpo lleva la contraseña
    })
    .then(({ body }) => ({ token: body.accessToken, name: body.user.name }));
}

export function apiRequest<T = unknown>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  token: string,
  body?: object,
  failOnStatusCode = true,
): Cypress.Chainable<Cypress.Response<T>> {
  return cy.request<T>({
    method,
    url: apiUrl(path),
    headers: { Authorization: `Bearer ${token}` },
    body,
    failOnStatusCode,
    timeout: API_TIMEOUT_MS,
  });
}

export function createPost(token: string, title: string): Cypress.Chainable<string> {
  return apiRequest<{ id: string }>("POST", "/posts", token, {
    title,
    content: "Publicación creada por la prueba E2E de notificaciones.",
    type: "general",
  }).then(({ body }) => body.id);
}

export function deletePost(token: string, postId: string): ApiResult {
  // Limpieza: si falla no debe tapar el resultado de la prueba.
  return apiRequest("DELETE", `/posts/${postId}`, token, undefined, false);
}

// El like es un interruptor: el primero lo da, el segundo lo quita.
export function toggleLike(token: string, postId: string): ApiResult {
  return apiRequest("POST", `/posts/${postId}/like`, token);
}

export function addComment(token: string, postId: string, content: string): ApiResult {
  return apiRequest("POST", `/posts/${postId}/comments`, token, { content });
}

// --- Eventos (#28) y perfil (#15) ---

export type ApiEvent = { id: string; name: string };

export function createEvent(token: string, name: string): Cypress.Chainable<ApiEvent> {
  return apiRequest<ApiEvent>("POST", "/events", token, {
    name,
    city: "Cali",
    date: "2027-03-15",
    organizer: "Prueba E2E",
    type: "meet",
  }).then(({ body }) => body);
}

export function deleteEvent(token: string, eventId: string): ApiResult {
  // Limpieza: si falla no debe tapar el resultado de la prueba.
  return apiRequest("DELETE", `/events/${eventId}`, token, undefined, false);
}

/** Campos del perfil que se pueden editar (PATCH /users/me). */
export type ApiProfile = {
  name: string;
  username: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
};

export function getMyProfile(token: string): Cypress.Chainable<ApiProfile> {
  return apiRequest<ApiProfile>("GET", "/users/me", token).then(({ body }) => ({
    name: body.name,
    username: body.username,
    bio: body.bio ?? null,
    city: body.city ?? null,
    country: body.country ?? null,
    avatarUrl: body.avatarUrl ?? null,
  }));
}

export function updateMyProfile(token: string, profile: Partial<ApiProfile>): ApiResult {
  return apiRequest("PATCH", "/users/me", token, profile);
}
