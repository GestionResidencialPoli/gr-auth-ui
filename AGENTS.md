# AGENTS.md — gr-auth-ui

## Alcance

Esta interfaz es el punto de autenticación y SSO de Gestion Residencial. Lee
la documentación del repositorio antes de cambiar el flujo de sesión y no
llames directamente a los microservicios: todas las peticiones pasan por
`gr-api-gateway`.

## Flujo de trabajo

- Trabaja siempre desde `develop` y crea una rama `feature/GR-<n>-<descripcion>`.
- Ejecuta `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` antes de abrir PR.
- No expongas tokens en URLs ni en almacenamiento del navegador; conserva las
  cookies HttpOnly y el intercambio SSO de un solo uso.
- No hagas push directo a `develop`, `qa` o `main`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
