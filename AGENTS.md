<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Boosted Front — guía para agentes y para el equipo

Este archivo lo leen todos los agentes (Claude Code, Codex, Cursor…) y todas las personas del equipo. Si algo de aquí cambia, se actualiza en un PR como cualquier otro cambio.

## Qué es este proyecto

Frontend de **BOOSTED**, una plataforma para aficionados a los carros: garaje digital (vehículos), modificaciones, bitácora de proyecto, publicaciones, comentarios, likes, eventos y moderación. Es la **parte 2** del curso Computación en Internet III (Universidad Icesi, 2026-02, docente Kevin Rodriguez); la parte 1 es la API NestJS en [`Computacion-3/Boosted`](https://github.com/Computacion-3/Boosted).

- **Entrega:** jueves 26 de noviembre de 2026, en la organización `Computacion-3`. Commits posteriores no se califican.
- **Equipo:** Jose Manuel Rojas (`jmrojas06`), Pierre Andres Cuevas (`pierrecuevas`), Juan Pablo Bello (`Bellito29`), Juan Sebastian Romero (`sebasGeto`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Redux Toolkit + react-redux. Pendiente de añadir: Cypress (E2E), cliente WebSocket, cliente GraphQL. Alias de imports: `@/*` → `src/*`.

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (puerto 3000; si la API local ya lo usa, `npm run dev -- -p 3001`) |
| `npm run build` | Build de producción (también valida tipos) |
| `npm run lint` | ESLint |
| `npm run lint:clean` | Linter de Clean Architecture del proyecto (ver abajo) |
| `npm run arch:inventory` | Inventario de entidades, casos de uso, datasources y slices existentes |
| `npx tsc --noEmit` | Chequeo de tipos |

Los dos últimos scripts viven en `.claude/skills/clean-arch-redux/scripts/`, una carpeta que **no se versiona** (ver «La skill»). Sin esa carpeta, `lint:clean` y `arch:inventory` fallan.

## Variables de entorno

Copiar `.env.example` a `.env.local`. `.env*` está ignorado, salvo `.env.example`.

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base de la API NestJS, sin barra final |
| `NEXT_PUBLIC_DATA_SOURCE` | `rest` o `graphql`: fuente de datos activa del módulo dual |
| `NEXT_PUBLIC_WS_URL` | URL del servidor WebSocket |

## Arquitectura: Clean Architecture feature-first

La regla única: **las dependencias del código fuente apuntan solo hacia adentro**. El control fluye hacia afuera en ejecución (clic → hook → thunk → caso de uso → repositorio → datasource → HTTP), pero ningún archivo interno importa uno externo.

```text
src/
  app/                       rutas de Next.js; solo componen presentación
  store/                     makeStore, hooks tipados, StoreProvider
  core/                      transversal: errors/, http/, components/ui/
  features/<feature>/
    domain/                  TypeScript puro
      entities/              <x>.ts
      repositories/          <x>.repository.ts           (puertos: interfaces)
      usecases/              <verbo>-<x>.usecase.ts      (un caso de uso por intención)
    infrastructure/
      dtos/                  <x>.dto.ts                  (espejo exacto del JSON)
      mappers/               <x>.mapper.ts               (toDomain / toDto)
      datasources/           <x>-datasource.interface.ts + implementaciones
      repositories/          <x>.repository.impl.ts
    di/                      <feature>.container.ts      (raíz de composición)
    presentation/
      viewmodels/            <x>.viewmodel.ts
      store/                 <feature>.slice.ts          (slice + thunks)
      hooks/                 use-<feature>.ts            (hook fachada)
      components/            PascalCase.tsx
```

Flechas permitidas: `presentation → domain`, `presentation/store → di`, `infrastructure → domain`, `di → domain + infrastructure`, `app → presentation`, `src/store → presentation/store`.

### Reglas que no se rompen

1. **Dominio** no importa nada fuera de dominio (salvo `src/core/errors` y `src/core/domain`): sin React, Next, Redux, `fetch`, `window` ni `process.env`. Las entidades validan sus invariantes en el constructor; los casos de uso reciben el repositorio por constructor y exponen un único `execute()`.
2. **Infraestructura** es la única capa que conoce el formato del cable. Los DTO nunca salen de ella; el mapper es la «aduana» (normaliza enums desconocidos, parsea fechas). El repositorio recibe el datasource **por constructor**.
3. **Datasources duales:** `RestDatasource` y `GraphQLDatasource` implementan la misma interfaz y devuelven los **mismos DTO**. El contenedor elige uno según `NEXT_PUBLIC_DATA_SOURCE`. Cambiar la variable no puede tocar casos de uso, entidades, slices ni componentes. El cliente WebSocket también vive en `infrastructure/datasources/` detrás de una interfaz.
4. **DI:** el contenedor es el único sitio que conoce clases concretas (funcional, sin librería de DI) y exporta casos de uso ya instanciados.
5. **Thunks** llaman solo a `<feature>Container.<casoDeUso>.execute()` y devuelven ViewModels, nunca entidades ni `fetch`. Solo `presentation/store/*.slice.ts` importa `di/`. El estado de Redux guarda ViewModels serializables, no instancias de entidades.
6. **Componentes** reciben props (ViewModels y callbacks). No importan `react-redux`, el store, slices ni contenedores. Los componentes de React **no acceden al store ni a la red**: usan hooks fachada (`useAuth`, `usePosts`…).
7. **`app/`:** las páginas son delgadas, consumen hooks fachada y componentes. `layout.tsx` sigue siendo Server Component y monta `<StoreProvider>`. El store se crea con `makeStore()` + `useState(makeStore)`.
8. Los eventos entrantes del WebSocket se despachan directamente al store de Redux, sin recargar la página. La conexión envía el JWT en el handshake.

Antes de dar una tarea por terminada: `npm run lint:clean`, `npx tsc --noEmit`, `npm run lint` y, si tocaste rutas, `npm run build`.

## La API (backend Boosted)

- Repo: `Computacion-3/Boosted` (rama `develop`). Swagger en `<API_URL>/api`. Sin prefijo global; CORS abierto.
- Auth: `POST /auth/register`, `POST /auth/login` → `{ accessToken, user }`; `POST /auth/logout` revoca el token. Rutas protegidas: `Authorization: Bearer <token>`. 401 si el token falta, es inválido, expiró o fue revocado.
- Roles: `aficionado`, `moderador`, `administrador`. El payload del JWT es `{ sub, email, role }`. Un cambio de rol o una desactivación tienen efecto inmediato en el backend.
- Referencia completa de endpoints, validaciones y matriz de permisos: README del repo `Boosted`, secciones 11 y 13. **No copiar contraseñas ni datos del seed a este repo.**
- **Estado a 2026-11-09:** la API es solo REST. Todavía **no** tiene GraphQL, WebSockets ni authorities/permisos granulares; el PDF del taller exige las tres cosas. Verifica el estado real del backend antes de asumir que ya existen.

## Decisiones abiertas del equipo (no asumir en silencio)

Si una tarea depende de una de estas, pregunta al equipo antes de decidir:

- Dónde se guarda el JWT (cookie httpOnly vs `localStorage`) y cómo se adjunta en las peticiones.
- Librería de UI: solo Tailwind o shadcn/ui.
- Qué módulo es el **dual** REST/GraphQL y qué funcionalidad en tiempo real se implementa.
- Diseño de authorities: de dónde salen y si van dentro del JWT.
- Dónde viven las extensiones del backend (GraphQL, WebSocket, authorities).

## Flujo de trabajo con Git

Mismo flujo que en `Boosted`:

| Rama | Uso |
| --- | --- |
| `main` | Versión estable; recibe los cambios integrados desde `develop` |
| `develop` | Integración; destino de los pull requests |
| `feature/*`, `fix/*`, `chore/*` | Trabajo por historia de usuario / issue; siempre desde `develop` actualizado |

- **Issues = historias de usuario.** Cada rama y cada PR referencian su issue (`Closes #N`).
- **Pull requests:** revisión de al menos otra persona del equipo antes de integrar. Que alguien más revise sirve también para que todos conozcan todo el código.
- **Commits:** Conventional Commits, en inglés, en modo imperativo: `tipo(alcance): descripción` (`feat(auth): add login form`, `fix(posts): handle empty list`, `test(e2e): cover logout`, `docs: …`, `chore: …`). Pequeños y frecuentes, sin commits masivos al final.
- **Autoría:** el historial de commits es evidencia de participación individual y se califica. Cada commit sale con la identidad de la persona que lo hace. **Ningún agente agrega `Co-Authored-By`, «Generated with …» ni cualquier firma o trailer de IA en commits o PRs, ni se configura como autor o committer.**

## Reglas para agentes

- No hagas `commit` ni `push` si la persona no lo pide explícitamente.
- Cada integrante debe poder explicar, depurar y defender **cualquier** parte del código en la sustentación oral. Prefiere código simple y legible, explica lo que generas y no metas abstracciones que el equipo no pueda defender.
- No añadas dependencias, librerías de UI ni cambios de arquitectura sin avisar.
- Nunca subas secretos: `.env*` está ignorado, solo se versiona `.env.example`.
- Mensajes de error y textos de la interfaz en español.

## La skill `clean-arch-redux`

El equipo comparte la skill `clean-arch-redux` (se entrega como `clean-arch-redux.zip`). **No está en el repo**: cada integrante la copia a `.claude/skills/clean-arch-redux/`, carpeta que `.gitignore` ignora. Sirve para planear y construir una feature (HU) con Clean Architecture + Redux y para auditarla con `lint:clean`. Su flujo: inventario de lo existente, preguntas sobre en qué capa va cada cosa, plan en `temp/<fecha>-<feature>/plan.md` (carpeta también ignorada), espera de «proceder» y luego implementación por olas, de adentro hacia afuera.

Si no tienes la skill, las reglas de arriba son las mismas que ella aplica; síguelas igual.
