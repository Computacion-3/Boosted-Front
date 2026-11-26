# Boosted Front

Frontend de **BOOSTED**, una plataforma para aficionados a los carros y al tuning donde se documentan los proyectos, se comparte con la comunidad y se encuentran personas con intereses similares.

Consume la API de [Boosted](https://github.com/Computacion-3/Boosted) (NestJS + PostgreSQL) y es la parte 2 del curso Computación en Internet III de la Universidad Icesi (2026-02).

## Enlaces

| Qué | Dónde |
| --- | --- |
| Backend desplegado (Render) | <https://boosted-api.onrender.com> |
| Documentación Swagger del backend | <https://boosted-api.onrender.com/api> |
| GraphQL del backend | <https://boosted-api.onrender.com/graphql> |
| Frontend desplegado (Vercel) | <https://boosted-front.vercel.app> |
| Repositorio del backend | <https://github.com/Computacion-3/Boosted> |

> Render duerme el servicio cuando no tiene tráfico: la primera petición después de un rato puede tardar cerca de un minuto. Las siguientes responden en menos de medio segundo.

## Contenido

1. [Estado del proyecto](#estado-del-proyecto)
2. [Tecnologías](#tecnologías)
3. [Arranque rápido](#arranque-rápido)
4. [Pruebas end-to-end](#pruebas-end-to-end)
5. [Arquitectura](#arquitectura)
6. [Módulo dual REST y GraphQL](#módulo-dual-rest-y-graphql)
7. [Despliegue](#despliegue)
8. [Flujo de trabajo y calidad](#flujo-de-trabajo-y-calidad)
9. [Autores y contexto académico](#autores-y-contexto-académico)

## Estado del proyecto

Situación al 26 de noviembre de 2026.

### Lo que funciona hoy

| Funcionalidad | Rutas | Qué incluye |
| --- | --- | --- |
| Registro e inicio de sesión | `/register`, `/login` | Validación con mensajes por campo, cookie de sesión `httpOnly` y cierre de sesión desde el menú de usuario. |
| Comunidad | `/posts`, `/posts/new`, `/posts/[id]`, `/posts/[id]/edit` | Publicaciones de 8 tipos, filtros, paginación, likes optimistas, comentarios (crear, editar, eliminar) y moderación (ocultar y restaurar) con el permiso `posts:moderate`. |
| Eventos | `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit` | Listado con filtros por ciudad, tipo y fechas, paginación y CRUD completo. Es el módulo dual REST y GraphQL. |
| Perfil | `/profile` | Ver y editar el perfil propio (nombre, usuario, biografía, ciudad, país y foto por URL). El correo y la contraseña no se editan aquí. |
| Administración | `/admin/users`, `/admin/roles` | Buscar usuarios, cambiar su rol y su estado, y ver y editar los permisos de cada rol. |
| Garaje | `/garage`, `/garage/[id]` | Mis vehículos y vehículos públicos, con búsqueda por marca, modelo o año y paginación de 9 en 9. Quien es dueño crea, edita y elimina el vehículo y, en su ficha, sus modificaciones y las entradas de su bitácora. La ficha tiene pestañas: ficha técnica, modificaciones, bitácora e inversión (esta última solo para el dueño: total invertido, gasto en modificaciones, gasto independiente y presupuesto planeado). |
| Notificaciones en tiempo real | Campana del Header | Aviso al autor de una publicación cuando alguien le da like o la comenta, sin recargar la página. |

### Pendiente

- **Portada** (`/`): sigue siendo una pantalla provisional.

## Tecnologías

| Pieza | Versión | Para qué |
| --- | --- | --- |
| Next.js (App Router) | 16.4 | Rutas, Server Components, Server Actions y `proxy.ts` |
| React | 19.3 | Interfaz |
| TypeScript | 5.9 | Tipado estricto |
| Redux Toolkit y react-redux | 2.14 y 9.3 | Estado global |
| Tailwind CSS y daisyUI | 4.3 y 5.7 | Estilos y componentes base |
| Zod | 4.6 | Validación de formularios |
| socket.io-client | 4.8 | Notificaciones en tiempo real |
| jwt-decode | 4.0 | Leer (no verificar) el token en el servidor |
| Cypress | 16.3 | Pruebas end-to-end |
| ESLint | 9 | Calidad de código |

## Arranque rápido

### Requisitos

- **Node.js 20.9 o superior** (lo exige Next 16; el proyecto se desarrolló con la versión 22) y npm.
- Una API de Boosted: la desplegada en Render o una local.

### Instalación

```bash
git clone https://github.com/Computacion-3/Boosted-Front.git
cd Boosted-Front
npm install
cp .env.example .env.local
```

En PowerShell, el último comando es `Copy-Item .env.example .env.local`.

Después elige a qué backend apuntar, editando `.env.local`.

**Opción A: con el backend desplegado**

```ini
API_URL=https://boosted-api.onrender.com
NEXT_PUBLIC_DATA_SOURCE=rest
NEXT_PUBLIC_WS_URL=https://boosted-api.onrender.com
```

**Opción B: con un backend local**

Deja los valores de `.env.example` (el backend en `http://localhost:3000`) y levanta la API siguiendo las secciones 6 a 9 del [README del backend](https://github.com/Computacion-3/Boosted#readme) (requisitos, instalación, ejecución con `npm run start:dev` y seed con `npm run seed`).

### Ejecutar

```bash
npm run dev
```

La aplicación queda en <http://localhost:3001> (el 3000 lo usa el backend). Para ver el resultado de producción en local:

```bash
npm run build
npm run start -- -p 3001
```

### Cuentas de prueba

El seed del backend crea un administrador, un moderador y dos aficionados. Los correos y la contraseña están en la sección 9 (Seed) del README del backend; no se repiten aquí. Para probar la administración hay que entrar con el administrador.

### Variables de entorno

| Variable | Qué es | Notas |
| --- | --- | --- |
| `API_URL` | URL base de la API, sin barra final | La lee solo el servidor (Server Actions y contenedores). No lleva `NEXT_PUBLIC_`, así que nunca llega al navegador. |
| `NEXT_PUBLIC_DATA_SOURCE` | `rest` o `graphql` | Fuente de datos del módulo dual (eventos). Si falta, usa `rest`. |
| `NEXT_PUBLIC_WS_URL` | URL del servidor WebSocket | Normalmente igual a `API_URL`. Es obligatoria para las notificaciones: sin ella la campana avisa que no está configurada. |

Las pruebas E2E usan además sus propias variables `E2E_*` (ver [Pruebas end-to-end](#pruebas-end-to-end)).

Next incrusta las variables `NEXT_PUBLIC_*` al construir. Si cambias una, hay que volver a ejecutar `npm run build` (o reiniciar `npm run dev`).

### Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3001 |
| `npm run build` | Build de producción (también valida tipos) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos (`next typegen` y `tsc --noEmit`) |
| `npm run lint:clean` | Linter de Clean Architecture del proyecto, en `scripts/architecture/` (ver [Calidad](#flujo-de-trabajo-y-calidad)) |
| `npm run arch:inventory` | Inventario de entidades, casos de uso, datasources y slices de cada funcionalidad |
| `npm run test:e2e` | Pruebas end-to-end con Cypress en la terminal (ver [Pruebas end-to-end](#pruebas-end-to-end)) |
| `npm run test:e2e:ui` | Las mismas pruebas en la interfaz de Cypress, para verlas paso a paso |
| `npm run typecheck:e2e` | Chequeo de tipos de la carpeta `cypress/` (aparte, porque `tsconfig.json` la excluye) |

## Pruebas end-to-end

Las pruebas E2E usan **Cypress**, como pide el enunciado del proyecto final. Abren un navegador real, navegan por la aplicación como una persona y hablan con una API de verdad.

### Qué necesita

1. El front en marcha en el puerto 3001 (`npm run dev`, o `npm run build` y `npm run start -- -p 3001`) y apuntando a una API. Cypress no lo levanta.
2. **Tres cuentas** de esa API, una por rol. Con el seed sirven las del [README del backend](https://github.com/Computacion-3/Boosted#readme) (sección 9).
3. Las credenciales, **sin subirlas al repositorio**. Ponlas en `.env.local` (solo los nombres están en `.env.example`), o copia `cypress.env.example.json` a `cypress.env.json` (está ignorado por Git), o define variables `CYPRESS_AFICIONADO_EMAIL`, etc.

| Variable | Para qué |
| --- | --- |
| `E2E_AFICIONADO_EMAIL`, `E2E_AFICIONADO_PASSWORD` | Cuenta sin permisos. También es la *autora* que recibe los avisos de las notificaciones |
| `E2E_MODERADOR_EMAIL`, `E2E_MODERADOR_PASSWORD` | Cuenta con `posts:moderate`. También es la *otra persona* que da like y comenta |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Cuenta con todos los permisos |
| `E2E_BASE_URL` | Opcional. URL del front; por defecto `http://localhost:3001` |
| `E2E_API_URL` | Opcional. API a la que habla la prueba; por defecto `http://localhost:3000`. Debe ser la misma que usa el front (`API_URL`) |

### Ejecutar

```bash
npm run test:e2e         # todas, en la terminal
npm run test:e2e:ui      # con la interfaz de Cypress
npm run typecheck:e2e    # tipos de la carpeta cypress/ (aparte, porque tsconfig.json la excluye)
```

Contra el backend de Render, en PowerShell (el primer arranque en frío puede tardar cerca de un minuto):

```powershell
$env:E2E_API_URL = "https://boosted-api.onrender.com"
npm run test:e2e
```

### Cómo están organizadas

```text
cypress.config.ts           carga .env.local, la dirección del front y de la API y las credenciales
cypress/
  support/accounts.ts       cuentas por rol (desde E2E_*)
  support/auth.ts           inicio de sesión por la interfaz, reutilizado con cy.session
  support/hydration.ts      espera a que React hidrate la página antes de teclear
  support/api.ts            llamadas directas a la API: iniciar sesión, publicaciones, like, comentar, eventos y perfil
  e2e/smoke.cy.ts           la app arranca, habla con la API y la sesión sirve
  e2e/access-control.cy.ts  qué ve y qué no ve cada rol
  e2e/notifications.cy.ts   avisos en tiempo real
  e2e/auth.cy.ts            registro, inicio de sesión, recarga y cierre de sesión
  e2e/events-access.cy.ts   quién ve Editar y Eliminar en un evento, y el 403 de la API
  e2e/profile.cy.ts         ver y editar el perfil propio, con sus validaciones
  e2e/garage.cy.ts          garaje: vehículos, modificaciones, bitácora, inversión y vehículos ajenos
```

- **La sesión se reutiliza.** Cada caso inicia sesión por el formulario de `/login` (así la cookie `httpOnly` la crea la Server Action del propio front) y `cy.session` la restaura sin repetir el formulario.
- **Control de acceso** (`access-control.cy.ts`): sin sesión, las rutas privadas redirigen a `/login`; el aficionado no ve los enlaces de administración ni las acciones de moderación y en `/admin/users` y `/admin/roles` ve el aviso «Error 403»; el moderador sí ve las acciones de moderación pero no entra a usuarios; el administrador entra a la gestión de usuarios desde el menú.
- **Autenticación** (`auth.cy.ts`, cinco casos): el registro con datos inválidos muestra los errores bajo cada campo sin enviar nada; el registro válido lleva a `/login` con «Tu cuenta quedó creada»; un correo repetido muestra el 409 de la API; un login incorrecto muestra «Credenciales inválidas» y no crea la cookie `session`; y un login correcto crea la cookie `httpOnly`, sobrevive a una recarga y se borra al cerrar sesión. Es la única suite que no usa las cuentas `E2E_*`: crea una cuenta nueva por corrida (`e2e_<fecha>@boosted.test`), así que cada ejecución deja una cuenta en la base porque la API no permite borrar la propia.
- **Eventos** (`events-access.cy.ts`): antes de empezar crea por la API un evento del moderador y otro del aficionado, y los borra al final. El aficionado no ve «Editar» ni «Eliminar» en el evento ajeno y en su `/edit` ve «No puedes editar este evento»; en el suyo sí los ve, y el moderador los ve en el evento de otra persona. La última prueba llama directo a `PATCH /events/:id` con el token del aficionado y espera un 403: ocultar el botón no protege, protege el backend.
- **Perfil** (`profile.cy.ts`): `/profile` muestra el perfil de la sesión; el formulario marca el usuario con espacios y la URL inválida y no envía nada; un usuario que ya existe muestra «Ese nombre de usuario ya está en uso» (409); guardar biografía y ciudad muestra «Perfil actualizado» y la API los devuelve; dejar la biografía vacía la borra. Guarda el perfil del aficionado al empezar y lo restaura al terminar.
- **Garaje** (`garage.cy.ts`, dos casos): el aficionado crea un vehículo, lo busca, lo edita, le registra una modificación y una entrada de bitácora, revisa que la pestaña de inversión sume bien los gastos y lo elimina. En un vehículo público de otra persona no ve «Editar vehículo», «Eliminar vehículo», «Inversión», «Nueva modificación» ni «Nueva entrada», y un `PATCH /vehicles/:id` directo a la API con su token responde 403. Cada caso usa una marca única y al final borra por la API los vehículos con esa marca, aunque la prueba haya fallado.
- **Notificaciones** (`notifications.cy.ts`, seis casos): la campana conectada y vacía, el contador y el aviso flotante tras un like, la lista y su enlace tras un comentario, «Marcar como leídas», lo que **no** debe avisar (el like propio y quitar un like) y la desaparición de la campana al cerrar sesión.
  - La otra persona actúa con `cy.request` directo a la API; el navegador no participa.
  - Cada caso crea su propia publicación y la borra al terminar, así que los likes (que son un interruptor) no se mezclan entre casos.
  - Los avisos **no se guardan**: quien no esté conectado cuando ocurre algo no lo recibe. Por eso cada caso espera a que la campana tenga `data-connection="connected"` antes de que la otra persona actúe, en lugar de dormir un tiempo fijo.
  - Cerrar sesión revoca el token del navegador, así que ese caso va al final del archivo. La prueba espera poco más de un segundo antes de abrir la sesión del navegador para que su token no sea idéntico al que usa para limpiar.

Todas esperan a que la página se hidrate antes de teclear: los campos de los formularios son controlados por React y, si se escribe antes, React los deja vacíos otra vez.

Estas pruebas revisan lo que muestra la interfaz. No reemplazan la protección real, que está en el backend y en las tres puertas descritas en [Control de acceso por permisos](#control-de-acceso-por-permisos).

## Arquitectura

### Clean Architecture por funcionalidad

El código se organiza por funcionalidad y dentro de cada una en capas. La regla única: **las dependencias del código fuente apuntan solo hacia adentro**.

```text
app/                           Rutas de Next.js: solo componen presentación
proxy.ts                       Primera puerta de la sesión
src/
  store/                       makeStore, hooks tipados, StoreProvider
  lib/                         Sesión en el servidor: token, cookie, DAL
  core/                        Transversal: errores, clientes HTTP y GraphQL, permisos, kit de UI
  shared/components/           Header, Navbar, menú de usuario
  features/<feature>/
    domain/                    Entidades, puertos (interfaces) y casos de uso: TypeScript puro
    infrastructure/            DTO, mappers, datasources (REST, GraphQL, socket) y repositorios
    di/                        Contenedor: único sitio que conoce las clases concretas
    presentation/              Server Actions, ViewModels, slice de Redux, hooks fachada y componentes
```

Un clic recorre este camino hacia afuera, y ningún archivo interno importa uno externo:

```text
componente -> hook fachada -> thunk del slice -> Server Action -> contenedor
  -> caso de uso -> repositorio (puerto) -> datasource (REST o GraphQL) -> API
```

Reglas que se cumplen en todo el código:

- El **dominio** no importa React, Next, Redux ni `fetch`. Las entidades validan sus invariantes y cada caso de uso expone un único `execute()`.
- Los **DTO** (espejo exacto del JSON de la API) no salen de `infrastructure`. El mapper es la aduana: normaliza lo desconocido antes de que llegue al dominio.
- Los **componentes** reciben props. No importan `react-redux`, el store ni la red: usan hooks fachada (`useEvents`, `useAuth`, `useNotifications`...).
- El estado de Redux guarda **ViewModels** planos y serializables, nunca instancias de entidades.
- Los errores esperados (validación, 401, 403, 404, 409) viajan como valor (`{ ok: false, message }`) y el thunk los convierte en un mensaje en español; no se muestra el texto técnico de la API.

### Funcionalidades

| Funcionalidad | Casos de uso | Fuente de datos |
| --- | --- | --- |
| `auth` | login, registro, logout | REST |
| `posts` | listar, ver, crear, editar, eliminar, like, ocultar, restaurar | REST |
| `comments` | listar, agregar, editar, eliminar | REST |
| `events` | listar, ver, crear, editar, eliminar | **REST o GraphQL** |
| `users` | listar (con búsqueda y paginación), cambiar rol, cambiar estado | REST |
| `roles` | ver roles y permisos, actualizar los permisos de un rol | REST |
| `notifications` | conectar, desconectar | WebSocket |
| `profile` | ver mi perfil, editar mi perfil (`GET` y `PATCH /users/me`) | REST |

### Sesión con cookie httpOnly

1. `loginAction` (una Server Action) llama a `POST /auth/login` y guarda el JWT en una cookie `httpOnly`, `secure` en producción y `sameSite: lax`, que vence junto con el token.
2. El JavaScript del navegador **no puede leer el token**. Al cargar la página, el layout raíz lee la cookie en el servidor y le pasa a Redux solo datos planos (id, nombre, rol y permisos) mediante `AuthHydrator`.
3. Todas las llamadas a la API salen del servidor de Next y llevan `Authorization: Bearer <token>`. Por eso no hay errores de CORS entre el navegador y la API; el backend además acepta cualquier origen.
4. El **cierre de sesión** revoca el token en el backend, borra la cookie, devuelve **todo** el store a su estado inicial y redirige a la portada.

### Control de acceso por permisos

El JWT trae los permisos del usuario con el formato `recurso:acción`: `users:read`, `users:update-role`, `users:update-status`, `posts:moderate`, `roles:read` y `roles:update`. Por defecto el aficionado no tiene ninguno, el moderador tiene `posts:moderate` y el administrador tiene todos; el administrador puede reasignarlos desde `/admin/roles`.

Se protege en **tres puertas**, y ninguna alcanza sola:

1. `proxy.ts` revisa que haya sesión. Todo es privado por defecto: una ruta nueva nace protegida.
2. Cada página exige sesión o permiso en el servidor (`requireSession`, `checkPermission`). Sin el permiso se muestra un aviso «No tienes acceso».
3. Cada Server Action exige sesión o permiso en su primera línea, porque una Server Action es un endpoint público.

Ocultar un botón con `hasPermission` o el componente `Can` solo orienta la interfaz. La barrera real es el backend, que vuelve a comprobar el permiso en cada petición.

### Estado global

Un único store de Redux Toolkit con un slice por funcionalidad (`auth`, `posts`, `comments`, `events`, `profile`, `users`, `roles`, `notifications`). Los componentes no tocan el store: usan hooks fachada que encapsulan el `dispatch` y los selectores. Al cerrar sesión se vacían todos los slices, así no queda en memoria nada de la persona anterior.

### Tiempo real

Las notificaciones usan Socket.IO. El cliente vive en `infrastructure/datasources/` detrás de una interfaz, y los eventos entrantes se despachan **directo al store de Redux**, sin recargar la página.

1. Mientras hay una persona con sesión, `NotificationsConnector` (montado en el layout raíz) abre la conexión; sin sesión la cierra.
2. El JWT está en una cookie `httpOnly`, así que el navegador no puede mandarlo en el handshake. El navegador le pide un **ticket** a un Route Handler del mismo origen (`POST /api/realtime/ticket`), que lee la cookie y llama a `POST /auth/socket-ticket` del backend con el JWT.
3. El ticket vale 60 segundos y **sirve una sola vez**. La conexión es `io(NEXT_PUBLIC_WS_URL, { auth: { ticket } })` y el backend valida el ticket y que la cuenta siga activa.
4. Si la conexión se cae, se reintenta con espera creciente (de 1 s hasta 30 s) y con un ticket nuevo en cada intento. No se reintenta si la sesión terminó o la cuenta no está disponible.
5. El Header muestra una campana con el contador de no leídas, la lista de las últimas 50 y un aviso flotante por cada notificación nueva.

Las notificaciones no se guardan en el backend: quien no está conectado no las recibe, y al recargar la página la lista empieza vacía.

## Módulo dual REST y GraphQL

`events` puede funcionar contra REST o contra GraphQL, y cambiar de uno a otro no toca los casos de uso, las entidades, el slice ni los componentes.

### Cómo está hecho

- **Un solo puerto** en el dominio: `EventRepository`, con las cinco operaciones (listar, ver, crear, editar y eliminar).
- **Dos datasources** que implementan la misma interfaz y devuelven **los mismos DTO**: `EventRestDatasource` y `EventGraphQLDatasource`. Cada uno usa su propio cliente (`core/http` y `core/graphql`), así que ninguno depende del transporte del otro.
- **El contenedor** (`events.container.ts`) elige uno según `NEXT_PUBLIC_DATA_SOURCE` y es el único archivo que conoce las clases concretas.
- Los demás módulos usan siempre REST: la variable solo cambia `events`, porque es el único módulo que el backend expone por GraphQL.

### Cómo cambiar de fuente

```ini
# .env.local
NEXT_PUBLIC_DATA_SOURCE=graphql
```

Y volver a construir (`npm run build`) o reiniciar `npm run dev`. La pantalla, los avisos y los errores son los mismos. Para llevar otro módulo a GraphQL basta con escribir su `XGraphQLDatasource` (que cumpla la misma interfaz y devuelva los mismos DTO) y agregar un `case` en su contenedor, siempre que el backend lo exponga.

### Comparativo medido

Medido el 23 de noviembre de 2026 contra el backend desplegado en Render, con 25 repeticiones por caso desde el equipo de desarrollo (solo lecturas). La compresión de la respuesta fue `br` en todos los casos; el tamaño es el del cuerpo sin comprimir.

| Caso | Tamaño | Latencia (mediana) | Latencia (p90) |
| --- | --- | --- | --- |
| Listado de 10 eventos por REST (todos los campos) | 3.137 bytes | 188 ms | 207 ms |
| Listado por GraphQL con los mismos campos | 3.158 bytes | 188 ms | 195 ms |
| Listado por GraphQL con solo los campos de la tarjeta | 1.581 bytes | 188 ms | 262 ms |
| Detalle de un evento por REST | 425 bytes | 187 ms | 195 ms |
| Detalle por GraphQL con los mismos campos | 445 bytes | 187 ms | 196 ms |

Con el mismo contenido, REST y GraphQL devuelven los eventos **idénticos campo por campo** (se comprobó con los 7 eventos de la base real, incluido un evento recién creado con el lugar en `null`).

### Diferencias que aparecieron al construirlo

| Aspecto | REST | GraphQL |
| --- | --- | --- |
| Endpoints | Cinco rutas (`GET /events`, `GET /events/:id`, `POST`, `PATCH` y `DELETE`) | Un solo endpoint (`POST /graphql`) con 2 consultas y 3 mutaciones |
| Qué campos llegan | Siempre todos | Solo los que se piden |
| Código del datasource de eventos | 35 líneas | 93 líneas (incluye los documentos GraphQL) |
| Cliente compartido | `core/http`: 226 líneas | `core/graphql`: 147 líneas |
| Estado HTTP de un error | El real: 404, 400 o 401 | Siempre 200; el error va dentro de `errors[]` |
| Dónde está el estado real del error | En la respuesta HTTP | En `errors[0].extensions.originalError.statusCode` |
| Documentación | Swagger en `/api` | Apollo Sandbox en `/graphql` (esquema generado desde el código) |
| Caché de lecturas | `GET` cacheable por HTTP | `POST`: no cacheable por HTTP (el front usa `no-store` en ambos) |

Una trampa real: en GraphQL **no** se debe leer `extensions.code` para saber el estado, porque un 404 llega como `INTERNAL_SERVER_ERROR`. El cliente GraphQL toma el estado de `originalError.statusCode` y lo convierte en el mismo error que REST, y por eso la interfaz muestra el mismo mensaje en español en los dos modos.

### Conclusión

Para este módulo, un recurso plano cuyas pantallas usan casi todos los campos, **no hay diferencia práctica de rendimiento**: la latencia (unos 188 ms) la domina la red, no el protocolo. La ventaja medible de GraphQL es pedir menos campos (el listado baja a la mitad cuando la pantalla solo necesita los de la tarjeta), aunque con compresión la diferencia real en la red es menor que la de la tabla. A cambio cuesta más código y pierde la caché HTTP y los estados HTTP. Por eso `rest` es la fuente por defecto y `graphql` queda disponible como alternativa demostrada: elegir una u otra es una variable de entorno, no una reescritura.

## Despliegue

### Backend

Desplegado en **Render** como servicio web con una base PostgreSQL administrada: <https://boosted-api.onrender.com> (Swagger en `/api`). El procedimiento, las variables de entorno y el seed están en la sección 19 del [README del backend](https://github.com/Computacion-3/Boosted#readme). Render duerme el servicio sin tráfico; conviene despertarlo antes de una demostración.

### Frontend

En producción: <https://boosted-front.vercel.app>.

El frontend se despliega en **Vercel** desde GitHub Actions, no desde el panel de Vercel: el archivo [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) valida el código y, solo si todo pasa y el cambio llegó a `main`, lo despliega.

**Qué hace el workflow**

| Cuándo | Qué corre |
| --- | --- |
| Pull request o push a `develop` o `main` | Trabajo `quality`: `npm run lint`, `npm run lint:clean -- --strict` (un aviso de arquitectura también falla), `npm run typecheck`, `npm run typecheck:e2e`, `npm run build`, y luego el build de producción se levanta en el puerto 3001 y corre `npm run test:e2e` (Cypress) contra la API de pruebas. Si algo falla, sube las capturas de Cypress como evidencia. |
| Push a `main`, con `quality` en verde | Trabajo `deploy`: descarga la configuración de producción de Vercel, construye con `vercel build --prod` y despliega ese mismo build con `vercel deploy --prebuilt --prod`. |

Las ejecuciones se hacen de a una (`concurrency`): las pruebas comparten cuentas de prueba y dos corridas a la vez se revocarían el token.

**Qué hay que configurar en GitHub** (Settings, Secrets and variables, Actions). Los valores no se versionan; aquí solo van los nombres:

| Tipo | Nombre | Para qué |
| --- | --- | --- |
| Variable | `E2E_API_URL` | API contra la que corren las pruebas (hoy la de Render). También se usa como `API_URL` y `NEXT_PUBLIC_WS_URL` del build de pruebas |
| Secreto | `E2E_AFICIONADO_EMAIL` y `E2E_AFICIONADO_PASSWORD` | Cuenta sin permisos |
| Secreto | `E2E_MODERADOR_EMAIL` y `E2E_MODERADOR_PASSWORD` | Cuenta con `posts:moderate` |
| Secreto | `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD` | Cuenta con todos los permisos |
| Secreto | `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` | Credenciales del despliegue en Vercel |

Si falta alguno de los de las pruebas, el trabajo `quality` falla desde el principio con «Missing CI configuration».

**Qué hay que configurar en Vercel.** Las variables de entorno del proyecto, **antes del primer build** (las `NEXT_PUBLIC_*` se incrustan al construir):

| Variable | Valor |
| --- | --- |
| `API_URL` | `https://boosted-api.onrender.com` |
| `NEXT_PUBLIC_DATA_SOURCE` | `rest` |
| `NEXT_PUBLIC_WS_URL` | `https://boosted-api.onrender.com` |

**Para desplegar:** abrir un pull request de `develop` a `main`, esperar a que `quality` salga en verde, revisarlo entre dos personas e integrarlo. El push resultante a `main` ejecuta `deploy`. Quien prefiera hacerlo a mano puede importar el repositorio en Vercel con las mismas variables y el comando de build por defecto (`next build`).

No hay problemas de CORS: las peticiones HTTP las hace el servidor de Next, el backend acepta cualquier origen y el gateway del WebSocket refleja el origen del navegador.

## Flujo de trabajo y calidad

- **Ramas:** `main` (estable), `develop` (integración y destino de los pull requests) y `feature/*`, `fix/*`, `chore/*` o `docs/*` desde `develop`.
- **Commits:** Conventional Commits en inglés (`feat(auth): add login form`), pequeños y frecuentes. El historial de cada persona es evidencia de su participación.
- **Pull requests:** hacia `develop`, con revisión de otra persona del equipo. Cada uno referencia su issue.
- **Antes de abrir un pull request:** `npm run typecheck`, `npm run lint` y `npm run build` sin errores, y `npm run test:e2e` si el cambio toca rutas, la sesión o los permisos. El CI repite todo eso en cada pull request (ver [Despliegue](#despliegue)).
- **`npm run lint:clean`** audita las dependencias entre capas: que el dominio no importe infraestructura ni frameworks, que los componentes no dependan de Redux, que la presentación no importe infraestructura ni el cliente HTTP, y que el contenedor solo lo lean las Server Actions (`presentation/actions`, con `"use server"`). Sus scripts están versionados en `scripts/architecture/`, así que cualquiera lo corre sin instalar nada aparte, y el CI lo ejecuta en modo estricto. Hoy da 0 errores y 0 avisos. `npm run arch:inventory` lista lo que ya existe en cada funcionalidad antes de crear algo nuevo.
- **Convenciones de arquitectura y de trabajo:** [`AGENTS.md`](./AGENTS.md).

## Autores y contexto académico

| Integrante | GitHub |
| --- | --- |
| Jose Manuel Rojas | [@jmrojas06](https://github.com/jmrojas06) |
| Pierre Andres Cuevas | [@pierrecuevas](https://github.com/pierrecuevas) |
| Juan Pablo Bello | [@Bellito29](https://github.com/Bellito29) |
| Juan Sebastian Romero | [@sebasGeto](https://github.com/sebasGeto) |

| Dato | Valor |
| --- | --- |
| Materia | Computación en Internet III (NRC 21568) |
| Programa | Ingeniería de Sistemas |
| Universidad | Universidad Icesi |
| Docente | Kevin Rodriguez |
| Entrega | 26 de noviembre de 2026 |
