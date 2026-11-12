# Boosted Front

Frontend de **BOOSTED**, una plataforma para aficionados a los carros y al tuning donde se documentan los proyectos, se comparte con la comunidad y se encuentran personas con intereses similares.

Consume la API REST de [Boosted](https://github.com/Computacion-3/Boosted) (NestJS + PostgreSQL) y es la parte 2 del curso Computación en Internet III de la Universidad Icesi (2026-02).

> Estado: en desarrollo. Este README se ampliará con la guía de arranque completa, los enlaces de despliegue y el comparativo REST vs GraphQL.

## Qué será

- **Garaje digital:** ficha técnica de cada vehículo, pública o privada.
- **Bitácora de proyecto:** modificaciones con estado y costos, entradas de avance, compras y problemas, y resumen de inversión.
- **Comunidad:** publicaciones de distintos tipos, comentarios, likes y eventos.
- **Moderación y administración:** moderación de contenido y gestión de roles y permisos de los usuarios.
- **Tiempo real:** actualizaciones en vivo mediante WebSockets con autenticación JWT.

## Enfoque técnico

- Next.js (App Router) con TypeScript, Tailwind CSS y daisyUI.
- Clean Architecture organizada por funcionalidad (`domain`, `infrastructure`, `presentation`).
- Estado global con Redux Toolkit y hooks fachada.
- Autenticación con JWT y control de acceso por roles y permisos.
- Fuente de datos intercambiable entre REST y GraphQL con `NEXT_PUBLIC_DATA_SOURCE`.
- Pruebas E2E con Playwright; frontend en Vercel y backend en la nube.

Las convenciones de arquitectura y de trabajo del equipo están en [`AGENTS.md`](./AGENTS.md).

## Primeros pasos

```bash
git clone https://github.com/Computacion-3/Boosted-Front.git
cd Boosted-Front
npm install
cp .env.example .env.local
npm run dev
```

La aplicación queda en `http://localhost:3001`. Necesita la API de Boosted corriendo (por defecto en `http://localhost:3000`) y `API_URL` apuntando a ella en `.env.local`. El detalle de la API está en el README del repositorio [`Boosted`](https://github.com/Computacion-3/Boosted).

## Autores

| Integrante | GitHub |
| --- | --- |
| Jose Manuel Rojas | [@jmrojas06](https://github.com/jmrojas06) |
| Pierre Andres Cuevas | [@pierrecuevas](https://github.com/pierrecuevas) |
| Juan Pablo Bello | [@Bellito29](https://github.com/Bellito29) |
| Juan Sebastian Romero | [@sebasGeto](https://github.com/sebasGeto) |

## Contexto académico

| Dato | Valor |
| --- | --- |
| Materia | Computación en Internet III (NRC 21568) |
| Programa | Ingeniería de Sistemas |
| Universidad | Universidad Icesi |
| Docente | Kevin Rodriguez |
| Entrega | 26 de noviembre de 2026 |
