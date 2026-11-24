# Boosted Front

Frontend de **BOOSTED**, una plataforma para aficionados a los carros y al tuning donde se documentan los proyectos, se comparte con la comunidad y se encuentran personas con intereses similares.

Consume la API de [Boosted](https://github.com/Computacion-3/Boosted) (NestJS + PostgreSQL) y es la parte 2 del curso Computación en Internet III de la Universidad Icesi (2026-02).

## Enlaces

| Qué | Dónde |
| --- | --- |
| Backend desplegado (Render) | <https://boosted-api.onrender.com> |
| Documentación Swagger del backend | <https://boosted-api.onrender.com/api> |
| GraphQL del backend | <https://boosted-api.onrender.com/graphql> |
| Frontend desplegado (Vercel) | Pendiente de desplegar (issue #30) |
| Repositorio del backend | <https://github.com/Computacion-3/Boosted> |

> Render duerme el servicio cuando no tiene tráfico: la primera petición después de un rato puede tardar cerca de un minuto. Las siguientes responden en menos de medio segundo.

## Contenido

1. [Estado del proyecto](#estado-del-proyecto)
2. [Tecnologías](#tecnologías)
3. [Arranque rápido](#arranque-rápido)
4. [Arquitectura](#arquitectura)
5. [Módulo dual REST y GraphQL](#módulo-dual-rest-y-graphql)
6. [Despliegue](#despliegue)
7. [Flujo de trabajo y calidad](#flujo-de-trabajo-y-calidad)
8. [Autores y contexto académico](#autores-y-contexto-académico)

## Estado del proyecto

Situación al 23 de noviembre de 2026.

### Lo que funciona hoy

| Funcionalidad | Rutas | Qué incluye |
| --- | --- | --- |
| Registro e inicio de sesión | `/register`, `/login` | Validación con mensajes por campo, cookie de sesión `httpOnly` y cierre de sesión desde el menú de usuario. |
| Comunidad | `/posts`, `/posts/new`, `/posts/[id]`, `/posts/[id]/edit` | Publicaciones de 8 tipos, filtros, paginación, likes optimistas, comentarios (crear, editar, eliminar) y moderación (ocultar y restaurar) con el permiso `posts:moderate`. |
| Eventos | `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit` | Listado con filtros por ciudad, tipo y fechas, paginación y CRUD completo. Es el módulo dual REST y GraphQL. |
| Administración | `/admin/users`, `/admin/roles` | Buscar usuarios, cambiar su rol y su estado, y ver y editar los permisos de cada rol. |
| Notificaciones en tiempo real | Campana del Header | Aviso al autor de una publicación cuando alguien le da like o la comenta, sin recargar la página. |

### Pendiente

- **Garaje y bitácora:** vehículos, modificaciones, bitácora de proyecto y resumen de inversión (issues #16 a #21), y el perfil (#15). Mientras no existan, el enlace «Garaje» del menú y «Mi perfil» del menú de usuario no llevan a ninguna pantalla.
- **Pruebas E2E automatizadas.** Hoy se verifica con `typecheck`, `lint`, `build` y pruebas manuales descritas en cada pull request.
- **Despliegue del frontend en Vercel** y el flujo de integración continua.
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

Next incrusta las variables `NEXT_PUBLIC_*` al construir. Si cambias una, hay que volver a ejecutar `npm run build` (o reiniciar `npm run dev`).

### Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3001 |
| `npm run build` | Build de producción (también valida tipos) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos (`next typegen` y `tsc --noEmit`) |
| `npm run lint:clean` | Linter de Clean Architecture del equipo (ver [Calidad](#flujo-de-trabajo-y-calidad)) |

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

Un único store de Redux Toolkit con un slice por funcionalidad (`auth`, `posts`, `comments`, `events`, `users`, `roles`, `notifications`). Los componentes no tocan el store: usan hooks fachada que encapsulan el `dispatch` y los selectores. Al cerrar sesión se vacían todos los slices, así no queda en memoria nada de la persona anterior.

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

Pendiente de desplegar en **Vercel** (issue #30). Cuando se despliegue:

1. Importar el repositorio `Computacion-3/Boosted-Front` en Vercel.
2. Definir estas variables de entorno **antes del primer build** (las `NEXT_PUBLIC_*` se incrustan al construir):

   | Variable | Valor |
   | --- | --- |
   | `API_URL` | `https://boosted-api.onrender.com` |
   | `NEXT_PUBLIC_DATA_SOURCE` | `rest` |
   | `NEXT_PUBLIC_WS_URL` | `https://boosted-api.onrender.com` |

3. Dejar el comando de build por defecto (`next build`) y desplegar.

No hay problemas de CORS: las peticiones HTTP las hace el servidor de Next, el backend acepta cualquier origen y el gateway del WebSocket refleja el origen del navegador.

## Flujo de trabajo y calidad

- **Ramas:** `main` (estable), `develop` (integración y destino de los pull requests) y `feature/*`, `fix/*`, `chore/*` o `docs/*` desde `develop`.
- **Commits:** Conventional Commits en inglés (`feat(auth): add login form`), pequeños y frecuentes. El historial de cada persona es evidencia de su participación.
- **Pull requests:** hacia `develop`, con revisión de otra persona del equipo. Cada uno referencia su issue.
- **Antes de abrir un pull request:** `npm run typecheck`, `npm run lint` y `npm run build` sin errores.
- **`npm run lint:clean`** audita las dependencias entre capas. Necesita la skill `clean-arch-redux`, que se copia a `.claude/skills/` y no se versiona. Hoy marca 6 errores y 8 avisos que son falsos positivos conocidos: la skill es anterior a las Server Actions y espera que el slice importe el contenedor directamente, mientras que aquí el contenedor es `server-only` y lo usan las acciones (`presentation/actions`) y no el slice. El detalle está en [`AGENTS.md`](./AGENTS.md).
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
