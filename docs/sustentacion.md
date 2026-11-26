# Guía de revisión cruzada y sustentación

Material para el issue #35. La sustentación es oral, individual y sincrónica: cada integrante tiene que poder explicar, depurar y defender **cualquier** parte del código, también la que escribió otra persona. Esta guía sirve para ensayarlo en una sesión de una hora.

## 1. Cómo se hace la sesión (60 min)

| Min | Qué se hace |
| --- | --- |
| 0–5 | Cada quien corre `git pull` en `develop`, `npm install` y deja el front corriendo contra el backend de Render. |
| 5–35 | **Rotación de módulos** (ver abajo): cada integrante explica en 7 minutos, abriendo el código, un módulo que **no escribió**. El resto pregunta. |
| 35–55 | **Preguntas de la sección 3**, sorteadas: quien responde no puede haber escrito el módulo por el que le preguntan. |
| 55–60 | Revisión de historial (sección 4) y lista de pendientes. |

### Rotación de módulos

Cada módulo lo explica alguien distinto de quien lo escribió. Para saber quién escribió qué: `git log --no-merges --format='%an' -- <carpeta> | sort | uniq -c`.

| Módulo | Dónde está | Qué hay que poder explicar |
| --- | --- | --- |
| Sesión y permisos | `proxy.ts`, `src/lib/`, `src/features/auth/` | Cookie `httpOnly`, las tres puertas, qué decodifica el front y qué verifica el backend. |
| Módulo dual de eventos | `src/features/events/` | Interfaz del datasource, los dos datasources, el contenedor, qué cambia al cambiar `NEXT_PUBLIC_DATA_SOURCE`. |
| Tiempo real | `src/features/notifications/`, `app/api/realtime/ticket/` | Ticket de un solo uso, reconexión, cómo llega un evento al store. |
| Publicaciones | `src/features/posts/`, `src/features/comments/` | Flujo clic → hook → thunk → Server Action → caso de uso → repositorio → datasource. |
| Pruebas E2E | `cypress/` | `cy.session`, por qué se espera la hidratación, qué cubre cada archivo. |

## 2. Antes de la sesión

- [ ] Leer `AGENTS.md` (arquitectura, reglas que no se rompen) y el README (módulo dual y comparativo).
- [ ] Haber abierto, al menos una vez, el módulo que te toca explicar y haber seguido una acción de punta a punta.
- [ ] Saber arrancar el front, correr `npm run typecheck`, `npm run lint` y `npm run test:e2e`.
- [ ] Tener a mano la lista de lo que **no** está terminado (sección 3, última pregunta): decirlo con claridad es mejor que que lo descubran.

## 3. Preguntas típicas y por dónde responderlas

Respuestas cortas y dónde verificarlas en el código. Se espera que cada quien las diga con sus palabras.

**¿Cuáles son las capas y cuál es la regla de dependencia?**
`domain` (TypeScript puro), `infrastructure`, `di`, `presentation`. Las dependencias apuntan solo hacia adentro: el dominio no importa React, Next, Redux ni `fetch`. Las flechas permitidas están en `AGENTS.md`, sección «Arquitectura».

**¿Qué pasa desde que se hace clic hasta que llega la respuesta?**
Componente → hook fachada (`use-<feature>`) → thunk del slice → Server Action (`presentation/actions`) → contenedor (`di/`) → caso de uso (`execute()`) → repositorio → datasource → HTTP. Ejemplo para seguir: `src/features/events/`.

**¿Por qué el contenedor es `server-only` y el slice no lo importa directo?**
Porque el contenedor y el cliente HTTP leen la cookie y `API_URL`, que solo existen en el servidor. El slice (que corre en el navegador) llama a una Server Action y esa llama al contenedor.

**¿Por qué la sesión va en una cookie `httpOnly` y no en `localStorage`?**
Porque JavaScript del navegador no puede leerla, así que un XSS no se la lleva. En `src/lib/session.ts`: `httpOnly`, `secure` solo en producción, `sameSite: "lax"` contra CSRF, y vence cuando vence el token.

**¿El front verifica el JWT?**
No. Solo lo **decodifica** (`jwt-decode`) para pintar la interfaz. La firma la verifica el backend en cada petición. Lo que el front lee nunca protege datos.

**¿Cuáles son las tres puertas de la sesión y por qué no basta con una?**
1. `proxy.ts`: ¿hay sesión? Todo es privado por defecto. No mira permisos, no verifica la firma y no cubre `/api`.
2. El DAL (`src/lib/dal.ts`, `requireSession`, `requirePermission`, `checkPermission`) en cada página.
3. Cada Server Action, en su primera línea: una Server Action es un endpoint público y se puede llamar sin pasar por la página. Las de login y registro son públicas por naturaleza.

Ocultar un botón (`hasPermission` de `useAuth`) solo cambia la interfaz; no protege.

**¿Por qué `redirect()` va fuera del `try/catch` en una Server Action?**
Porque `redirect()` funciona lanzando una excepción y el `catch` se la tragaría.

**¿Roles o permisos?**
Permisos con formato `recurso:acción` (`posts:moderate`, `users:read`…). Viajan en el JWT, pero el backend los vuelve a comprobar y un cambio de rol o de permisos tiene efecto inmediato aunque el token siga vigente.

**¿Cómo se manejan los errores?**
Los esperados (validación, 401, 403, 404, 409) la Server Action los **devuelve** como `ActionResult` (`{ ok: false, message }`) y el thunk hace `rejectWithValue`. Los inesperados los atrapa el `try/catch` del thunk o `app/error.tsx`. El mensaje técnico de la API nunca se muestra tal cual: `getHttpErrorMessage(status)` lo traduce.

**¿Por qué las Server Actions devuelven ViewModels?**
Porque lo que cruza del servidor al navegador tiene que ser serializable: objetos planos, no entidades ni clases. Redux guarda ViewModels.

**Explica el módulo dual REST y GraphQL.**
Un puerto (`EventDatasource`), dos implementaciones que devuelven los **mismos DTO**, y un contenedor que elige según `NEXT_PUBLIC_DATA_SOURCE`. Cambiar la variable no toca casos de uso, entidades, slices ni componentes. Cada datasource tiene su propio cliente (`src/core/http/` y `src/core/graphql/`): `apiClient` y `ApiError` son un detalle de REST.

**¿Qué diferencias reales encontraron entre REST y GraphQL?**
La latencia es la misma (la domina la red). GraphQL permite pedir menos campos, pero pierde la caché HTTP y los códigos de estado: responde siempre 200 y el estado real viene en `errors[0].extensions.originalError.statusCode` (un 404 llega como `INTERNAL_SERVER_ERROR`, por eso no se usa `extensions.code`). El detalle y las cifras están en el README.

**¿Por qué `makeStore` es una fábrica y no un singleton?**
Porque en Next.js el mismo módulo se reutiliza entre peticiones del servidor y un store global mezclaría el estado de personas distintas. Al cerrar sesión se vacía todo el store (`src/store/store.ts`), no solo `auth`.

**¿Cómo funciona el tiempo real y por qué no se manda el JWT en el handshake?**
El navegador no puede leer la cookie `httpOnly`, así que pide un **ticket de un solo uso** a un Route Handler del mismo origen (`app/api/realtime/ticket/route.ts`), que lee la sesión y llama al backend. El socket se conecta con `auth: { ticket }` y cada intento de conexión pide uno nuevo. Es una decisión consciente distinta de lo que dice el enunciado (token JWT en el handshake): hay que poder justificarla. La reconexión espera de 1 s hasta 30 s y no reintenta si la sesión terminó (401).

**¿Cómo llega un aviso al store?**
El datasource de socket.io recibe el evento `notification` y se despacha directo al slice, sin recargar la página.

**¿Qué cubren las pruebas E2E y por qué Cypress?**
Cypress es lo que pide el enunciado. Cubren humo, control de acceso por rol y notificaciones en tiempo real. La sesión se inicia por el formulario y `cy.session` la reutiliza; se espera a que la página se hidrate antes de teclear porque los campos son controlados por React. Revisan lo que muestra la interfaz: la protección real está en el backend y en las tres puertas.

**¿Cómo se evitan los errores de CORS?**
Las peticiones HTTP las hace el servidor de Next, no el navegador. El backend acepta cualquier origen y el gateway del WebSocket refleja el origen del navegador.

**¿Qué falta o qué no funciona perfecto?**
Decirlo uno mismo y con precisión. Para saber el estado real, no de memoria: issues abiertos con `gh issue list --state open`, el README (sección «Pendiente») y el historial. Limitaciones conocidas que ya están anotadas en las reseñas: un administrador puede quitarse a sí mismo `roles:read`, el cambio de rol no pide confirmación, algunos mensajes de la API se muestran crudos y `requirePermission` lanza un `Error` plano.

## 4. Revisión del historial de commits

El historial individual se califica. Para revisarlo:

```bash
git fetch origin
git shortlog -sn --no-merges origin/develop          # commits por persona
git log --no-merges --format='%ad %an' --date=short origin/develop | sort | uniq -c   # por día y persona
```

Qué mirar: que cada integrante tenga commits **constantes y relevantes** en las semanas de trabajo, que no haya commits masivos de última hora y que cada commit salga con la identidad de quien lo hizo (`git config user.name` y `user.email` correctos en cada máquina). Quien no tenga commits en este repositorio debe acordar con el equipo qué módulo toma **hoy** y abrir su PR a `develop`: los commits posteriores a la fecha de entrega no se califican.
