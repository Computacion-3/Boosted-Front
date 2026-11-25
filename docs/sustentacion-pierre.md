# Repaso de sustentación — Pierre (Boosted Front)

25 de noviembre de 2026 · Pierre Andres Cuevas (`pierrecuevas`)

Complemento personal de [`sustentacion.md`](./sustentacion.md) (issue #35): lo que hice yo, cómo funciona y cómo defenderlo.

## Mapa de lo que hice

Hice toda la autenticación y la seguridad del front: el store, la sesión con cookie httpOnly, las pantallas de cuenta, los permisos, la administración y sus pruebas E2E. Todo sigue la misma cadena: **clic → hook fachada → thunk → Server Action → contenedor → caso de uso → repositorio → datasource → API**.

| Issue | Qué es | PR | Archivos clave |
| --- | --- | --- | --- |
| #2 | Store de Redux | #41, #44 | `src/store/` |
| #3 | Sesión en el servidor | #45 | `src/lib/token.ts`, `session.ts`, `dal.ts`, `proxy.ts` |
| #9 | Login | #54 | `src/features/auth/`, `app/(auth)/login/` |
| #11 | Sesión al recargar | #57 (→ #65) | `AuthHydrator.tsx`, `app/layout.tsx`, `use-auth.ts` |
| #10 | Logout | #58 (→ #65) | `logoutAction`, `src/store/store.ts`, `app-header.tsx` |
| #8 | Registro | #66 | `register.schema.ts`, `RegisterForm.tsx`, `app/(auth)/register/` |
| #12 | Rutas protegidas | #67 | `events.actions.ts` (auditoría de las 3 puertas) |
| #13 | Permisos en la interfaz | #68 | `src/core/permissions.ts`, `Can.tsx`, `AccessDenied.tsx` |
| #14 | Administración | #69 | `src/features/users/`, `src/features/roles/`, `app/(app)/admin/` |
| #31 | E2E de autenticación | #79 | `cypress/e2e/auth.cy.ts`, `cypress/support/hydration.ts` |

Revisé además el #36 (estructura), #42 (CSS y typecheck), #53 (feed, validado contra el backend real) y #65 (llevar mi sesión y logout a `develop`).

## Store de Redux (#2)

El store es una **fábrica** (`makeStore()`), no un objeto global, y cada pestaña del navegador crea el suyo una sola vez.

- **`src/store/store.ts`** — `makeStore()` arma `configureStore` con un `rootReducer`. Exporta `AppStore`, `RootState` y `AppDispatch`, que se infieren solos del store.
- **Por qué fábrica:** en Next el mismo módulo se reutiliza entre peticiones del servidor. Un store global mezclaría el estado de dos usuarios distintos.
- **`src/store/hooks.ts`** — `useAppDispatch` y `useAppSelector` con `.withTypes<>()`. Solo los usan los hooks fachada (`useAuth`, `useUsers`…), nunca los componentes.
- **`src/store/StoreProvider.tsx`** — es `'use client'` porque react-redux usa React Context. `useState(makeStore)` pasa la función sin llamarla: React la ejecuta solo en el primer render.
- **`app/layout.tsx`** sigue siendo Server Component y solo envuelve `children` con `<StoreProvider>`.
- **Reset en logout (#10):** `appReducer = combineReducers({...})` y un `rootReducer` que, si llega `auth/logout/fulfilled`, llama `appReducer(undefined, action)`. Con `undefined` cada slice vuelve a su estado inicial, así no quedan en memoria datos de la persona anterior.
- **Registrar una feature** es una línea en `appReducer` (por ejemplo `users: usersReducer`) y `RootState` se actualiza solo.

## Sesión con cookie httpOnly (#3)

El JWT lo emite el backend y vive en una cookie **httpOnly**: el JavaScript del navegador no la puede leer, así que un ataque XSS no puede robar el token. El front solo **decodifica** el token para la interfaz; **la firma la verifica el backend** en cada petición.

| Archivo | Qué hace | Dónde corre |
| --- | --- | --- |
| `src/lib/token.ts` | `SESSION_COOKIE = "session"`, el tipo `TokenPayload` (`sub`, `name?`, `email?`, `role`, `permissions?`, `exp`) y `decodeToken()` con `jwt-decode`. Devuelve `null` si no hay token, si no se puede leer o si venció (`exp * 1000 < Date.now()`). | En cualquier lado: es puro, por eso lo usa `proxy.ts` |
| `src/lib/session.ts` | `createSession(token)` guarda la cookie y `deleteSession()` la borra. | Solo servidor (`import "server-only"`), y solo en Server Actions o Route Handlers |
| `src/lib/dal.ts` | `getSession()`, `requireSession()` (sin sesión → `redirect("/login")`), `requirePermission(p)` (sin permiso → lanza error) y `checkPermission(p)` (devuelve `true`/`false` para páginas). | Solo servidor |
| `proxy.ts` | Primera puerta: revisa si hay sesión y redirige. En Next 16 reemplaza a `middleware.ts` y exporta `proxy`. | Antes de renderizar cualquier ruta |

**Opciones de la cookie** (en `createSession`):

- `httpOnly: true` — JavaScript no la lee (protege contra XSS).
- `secure` solo en producción — en local se usa `http://localhost`.
- `sameSite: "lax"` — no viaja en peticiones entre sitios, salvo al seguir un enlace (protege contra CSRF).
- `expires` = `exp` del token — la cookie vence cuando vence el token.
- `path: "/"` — viaja en todas las rutas.

**Decisión propia en `proxy.ts`:** todo está **protegido por defecto**. Solo `/` es pública, y `/login` y `/register` son solo para quien no tiene sesión (si la tiene, va a `HOME_ROUTE = "/events"`, en `src/lib/routes.ts`). Así cada ruta nueva nace protegida. El `matcher` excluye `/api`, `_next/static`, `_next/image` y cualquier archivo con extensión.

**`getSession()` devuelve** `{ userId, name, email, role, permissions, accessToken }`. El `accessToken` lo usa `apiClient` (#46, de Jose) para mandar `Authorization: Bearer`, y nunca llega al navegador.

## Login, registro, logout e hidratación (#8–#11)

La feature `src/features/auth/` sigue las capas al pie de la letra. Así se recorre el login de punta a punta:

1. **`LoginForm.tsx`** (componente): valida con `loginSchema` (zod) y, si todo está bien, llama `onSubmit(values)`. No conoce Redux.
2. **`login-view.tsx`** (vista de cliente en `app/(auth)/login/`): usa `useAuth().login(values)`. Si devuelve `true`, hace `router.replace(HOME_ROUTE)` y `router.refresh()` para que el layout lea la cookie nueva.
3. **`useAuth()`** (hook fachada): `dispatch(login(values))` y devuelve `login.fulfilled.match(result)`.
4. **`auth.slice.ts`** (thunk `login`): llama a la Server Action. Si `ok: false` → `rejectWithValue(message)`.
5. **`loginAction`** (`presentation/actions`, `'use server'`): vuelve a validar con zod (es un endpoint público), llama `authContainer.login.execute()`, luego `createSession(token)` y devuelve solo `{ id, name, role, permissions }`, **nunca el token**. Errores: 401 → «Credenciales inválidas», 403 → «Tu cuenta está desactivada…».
6. **`auth.container.ts`** (`server-only`): el único que conoce clases concretas; arma `AuthRepositoryImpl(new AuthRestDatasource())`.
7. **`LoginUseCase`** (dominio): correo con `trim` y en minúsculas; campos vacíos → `DomainError`.
8. **`AuthRepositoryImpl` → `AuthMapper` → `AuthRestDatasource`**: `apiClient.post("/auth/login", body, { auth: "none" })`. Va con `auth: "none"` porque al hacer login todavía no hay sesión; con el valor por defecto, `apiClient` daría 401 sin llegar a la API.

**Registro (#8):** el mismo camino con `registerAction` → `RegisterUseCase` → `POST /auth/register`.

- `register.schema.ts` copia las reglas del backend: usuario de 3 a 30 con letras, números y `_`; contraseña de 8 a 72; bio hasta 500.
- La confirmación de contraseña es un `.refine` del formulario y **no viaja** al backend.
- El 409 muestra el mensaje del backend tal cual, que ya está en español y dice qué se repite.
- No inicia sesión: lleva a `/login?registered=1` y `/login` muestra el aviso verde. En Next 16, `searchParams` es una Promise, así que la página hace `await`.

**Hidratación (#11):** sin esto, Redux olvida a la persona en cada F5 aunque la cookie siga viva.

- `app/layout.tsx` (Server Component) llama `getSession()` y arma solo `{ id, name, role, permissions }` con `AuthUserViewModelMapper.fromSession`.
- Se lo pasa a `<AuthHydrator user={...} />`, un componente invisible que en un `useEffect` llama `useAuth().hydrate(user)` → `setUser`.
- A diferencia del curso, `AuthHydrator` no usa `useAppDispatch`: pasa por el hook, porque los componentes no tocan el store.
- Si el token venció, `getSession()` da `null` y la persona queda sin sesión.
- Efecto: como el layout raíz lee la cookie, todas las rutas se renderizan por petición (`ƒ` en el build).

**Logout (#10):** `logoutAction` primero revoca el token en el backend con `POST /auth/logout` (Bearer) y **después** borra la cookie.

- Si el backend falla, la cookie se borra igual, para que nadie quede atrapado con la sesión abierta.
- El thunk `logout` dispara el reset de todo el store.
- `app/(app)/app-header.tsx` existe porque el layout de `(app)` es Server Component y no puede usar hooks: envuelve el `Header` y le pasa `onLogout`, que llama `logout()`, luego `router.replace("/")` y `router.refresh()`.
- Probé que el token queda revocado: después del logout, el mismo token responde 401 «La sesión fue cerrada». Ojo: el backend guarda los revocados en memoria, así que si la API se reinicia vuelven a servir.

## Rutas protegidas y permisos (#12, #13)

Ocultar un botón no es proteger. La protección real son tres puertas en el servidor; los permisos en la interfaz solo deciden qué se muestra.

**#12 — auditoría de las tres puertas.** Revisé las 6 páginas protegidas y las 15 Server Actions y encontré un hueco real: `getEventsAction` y `getEventByIdAction` no tenían guardia.

- Llamadas directo, sin cookie y desde `/`, que el proxy deja pasar, **devolvieron los 7 eventos**.
- Les puse `requireSession()` en la primera línea. Ahora responden `x-action-redirect: /login`.
- La guardia va **fuera del `try/catch`**, porque `redirect()` funciona lanzando una excepción y el `catch` se la tragaría.
- Pruebas con `curl`: rutas protegidas sin cookie → 307 a `/login`; un aficionado que llama `hidePostAction` → rechazado, y la publicación sigue con `hidden: false`.

**#13 — permisos en la interfaz:**

| Pieza | Para qué |
| --- | --- |
| `src/core/permissions.ts` | `PERMISSIONS` con los 6 permisos del backend (`users:read`, `users:update-role`, `users:update-status`, `posts:moderate`, `roles:read`, `roles:update`) y el tipo `Permission`. Un permiso mal escrito **no compila**; antes solo escondía un botón sin avisar. |
| `useAuth().hasPermission(p)` / `hasRole(r)` | Leen el permiso del usuario en Redux. Solo orientan la interfaz. |
| `<Can permission={...} fallback?>` | Envuelve una acción y la muestra solo con el permiso (en `features/auth/presentation/components/`). |
| `checkPermission(p)` en el DAL | Para páginas: exige sesión y devuelve `true` o `false` sin lanzar error. |
| `AccessDenied` (kit de UI) | Aviso «No tienes acceso» (403) en vez de «Algo salió mal». |
| `nav-items.ts` | Cada enlace del menú puede llevar un `permission` y `filterNavItems` lo esconde. |

**Por qué no `forbidden()` de Next:** es experimental y exige activar `experimental.authInterrupts` en `next.config.ts`. Con un componente propio la página responde HTTP 200 con el aviso, pero los datos siguen protegidos por el DAL y el backend.

Por defecto el aficionado no tiene permisos, el moderador tiene `posts:moderate` y el administrador tiene los 6. Los permisos del token valen hasta que vence; el backend los consulta en cada petición y responde 403 si falta alguno.

## Administración de usuarios y roles (#14)

Son dos features separadas porque son dos conceptos del dominio distintos: `users` (cuentas) y `roles` (qué permite cada rol).

**Feature `users` — `/admin/users` (exige `users:read`):**

- **Entidad `ManagedUser`:** valida rol y estado en el constructor y tiene `isActive()` y `matches(texto)`, que busca en nombre, usuario o correo sin distinguir mayúsculas.
- **`GetUsersUseCase`:** `GET /users` devuelve **todas** las cuentas sin paginar, así que la búsqueda y la paginación se hacen aquí (`filter` + `slice`). Si algún día el backend pagina, solo cambian el datasource y el repositorio.
- **`ChangeUserRoleUseCase` y `ChangeUserStatusUseCase`:** usan `PATCH /users/:id/role` y `/status`.
- **Interfaz:** búsqueda con *debounce* de 400 ms, selector de rol y botón Activar/Desactivar (desactivar pide confirmación en un `Modal`). La fila propia lleva «Tú» y sus controles están deshabilitados; el backend igual responde 400 «No puedes cambiar tu propio rol o estado».

**Feature `roles` — `/admin/roles` (exige `roles:read`):**

- **`GetRolesOverviewUseCase`:** `GET /roles` y `GET /permissions` en paralelo (`Promise.all`).
- **`UpdateRolePermissionsUseCase`:** `PUT /roles/:role/permissions` **reemplaza la lista completa**.
- **Regla de negocio en el dominio:** el administrador no puede perder `roles:update`, porque nadie podría volver a editar los roles. El caso de uso lanza `DomainError` antes de ir a la red, y el backend también lo rechaza con 400.
- **Interfaz:** una tarjeta por rol con un borrador local y los botones «Guardar» y «Descartar». Sin `roles:update` es de solo lectura.

**Cada Server Action exige su permiso** en la primera línea: `users:update-role`, `users:update-status` y `roles:update`.

**Un hallazgo del linter que corregí:** un ViewModel importaba el tipo `RolesOverview` desde el archivo del caso de uso, y la presentación no debe depender de casos de uso. Lo moví al puerto (`role.repository.ts`). También `UsersTable` usaba la entidad del dominio; ahora toma tipos y opciones del ViewModel (`USER_ROLE_OPTIONS`).

## Pruebas E2E de autenticación con Cypress (#31)

`cypress/e2e/auth.cy.ts` cubre los cuatro criterios del issue en 5 casos. Pasa **5 de 5 sin reintentos**, contra el backend real.

| Caso | Qué comprueba |
| --- | --- |
| Registro inválido | errores bajo cada campo (`input-error`) y no sale de `/register` |
| Registro válido | va a `/login?registered=1` con «Tu cuenta quedó creada» |
| Correo repetido | «El correo ya está registrado» (409) |
| Login incorrecto | «Credenciales inválidas» y **no** existe la cookie `session` |
| Login, recarga y logout | cookie con `httpOnly: true`; F5 mantiene la sesión; con sesión `/login` devuelve a la home; «Cerrar sesión» borra la cookie y `/events` vuelve a pedir login |

- **La prueba crea su propia cuenta** con un correo único (`e2e_<timestamp>@boosted.test`). No necesita contraseñas guardadas ni el seed, así que corre igual en local o contra el despliegue. Cypress sí puede leer cookies httpOnly; la página no.
- **`waitForHydration()`** (`cypress/support/hydration.ts`): Next manda el HTML ya pintado y React lo «toma» un momento después. Si Cypress escribe antes, React reinicia los campos y lo escrito se pierde. El ayudante espera a que React marque el nodo (`__reactFiber…`). Sin él fallaban el registro (el nombre quedaba vacío) y el menú de usuario.
- **Prueba de mutación:** comenté `deleteSession()` en `logoutAction` y la prueba falló donde debía («la cookie no debía existir»). Eso demuestra que la prueba detecta errores reales.
- **Por qué Cypress:** es lo que pide el enunciado. Sebastián había integrado Playwright, y el equipo se quedó con Cypress (#73).
- **Cómo correrla:** `npm run dev` y luego `npm run test:e2e -- --spec cypress/e2e/auth.cy.ts`. Desde la terminal de VS Code puede fallar con «bad option: --smoke-test» porque VS Code define `ELECTRON_RUN_AS_NODE=1`; se arregla con `env -u ELECTRON_RUN_AS_NODE` delante.

## Preguntas probables

| Pregunta | Respuesta corta | Dónde verificar |
| --- | --- | --- |
| ¿Por qué cookie httpOnly y no `localStorage`? | JavaScript no puede leer la cookie, así que un XSS no roba el token. Con `localStorage` cualquier script lo lee. | `src/lib/session.ts` |
| ¿El front verifica la firma del JWT? | No. Solo lo decodifica para la interfaz y las redirecciones. La firma la verifica el backend en cada petición. | `src/lib/token.ts` |
| ¿Cuáles son las tres puertas? | 1) `proxy.ts`: ¿hay sesión? 2) El DAL en cada página: `requireSession` o `checkPermission`. 3) Cada Server Action: `requireSession` o `requirePermission` en la primera línea. Ninguna sola alcanza. | `proxy.ts`, `src/lib/dal.ts`, `*.actions.ts` |
| ¿Por qué la guardia va fuera del `try/catch`? | `redirect()` funciona lanzando una excepción; dentro del `try` el `catch` se la tragaría y no redirigiría. | cualquier `*.actions.ts` |
| ¿Por qué el slice no llama al contenedor directamente? | El contenedor es `server-only`. El thunk llama a una Server Action (`'use server'`) y esa llama al contenedor. Por eso `lint:clean` marca `presentation/actions`: la skill es anterior a las Server Actions. | `auth.slice.ts`, `auth.actions.ts` |
| ¿Por qué `makeStore()` y no un store global? | En el servidor el módulo se comparte entre peticiones; un global mezclaría usuarios. `useState(makeStore)` crea uno por pestaña. | `src/store/` |
| ¿Cómo se mantiene la sesión al recargar? | El layout raíz lee la cookie con `getSession()` y `AuthHydrator` la pasa a Redux con `setUser`. | `app/layout.tsx`, `AuthHydrator.tsx` |
| ¿Qué hace el logout? | Revoca el token en el backend, borra la cookie (aunque el backend falle) y vacía **todo** el store con `appReducer(undefined, action)`. | `logoutAction`, `src/store/store.ts` |
| Si oculto un botón, ¿ya está protegido? | No. `hasPermission` y `<Can>` solo deciden qué se ve. Protegen el DAL, cada Server Action y el backend (403). | `Can.tsx`, `dal.ts` |
| ¿Qué vive en el dominio y qué no? | En el dominio: reglas que valen para cualquier cliente (correo en minúsculas, rol válido, el administrador no pierde `roles:update`). Fuera: la cookie, HTTP, zod y los textos de la pantalla. | `domain/usecases/` |
| ¿Por qué el login usa `auth: "none"`? | Al hacer login todavía no hay sesión; con `required`, `apiClient` daría 401 sin llamar a la API. | `auth-rest-datasource.ts` |
| ¿Por qué la búsqueda de usuarios está en el caso de uso? | `GET /users` no pagina ni filtra. El puerto ya recibe `page`, `limit` y `search`: si el backend pagina, solo cambia infraestructura. | `get-users.usecase.ts` |
| ¿Qué es `waitForHydration` en Cypress? | Espera a que React tome la página antes de escribir; si no, React borra lo escrito al hidratar. | `cypress/support/hydration.ts` |
| ¿Qué no quedó perfecto? | La página 403 responde HTTP 200 (no usamos `forbidden()`, que es experimental). Los tokens revocados se pierden si la API se reinicia. Cada corrida E2E deja una cuenta de prueba. | — |

Comandos para mostrar en vivo: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run lint:clean` y `npm run test:e2e -- --spec cypress/e2e/auth.cy.ts`.
