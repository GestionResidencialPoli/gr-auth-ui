# GR Auth UI

Login y recuperación de contraseña centralizados para los tres roles de Gestión Residencial: residente, vigilante y administración.

## Por qué existe este repositorio

Hasta `GR-153`, cada rol iniciaba sesión dentro de `gr-common-ui`. Con el puente SSO generalizado a los tres roles (`GR-151`), un único punto de entrada puede autenticar y luego enviar a cada persona a la aplicación de su rol, con sesión propia en ese origen. Ese punto de entrada es este repositorio.

## Biblioteca compartida

Consume dos paquetes públicos publicados por `gr-common-ui`:

- [`@gestionresidencial/shared-ui`](https://www.npmjs.com/package/@gestionresidencial/shared-ui) — `AuthLayout`, `LoginForm`, `PasswordField`, primitivos.
- [`@gestionresidencial/auth-client`](https://www.npmjs.com/package/@gestionresidencial/auth-client) — `authService.login`, `apiFetch`, mapeo de errores.

Instalados como dependencias normales, en su versión publicada — este es un repositorio distinto a `gr-common-ui`, no hay workspace compartido. Antes de agregar algo aquí, lee la [guía de contribución](https://github.com/GestionResidencialPoli/gr-common-ui/blob/main/docs/contribuir.md) de `gr-common-ui`: si el cambio no es específico de este repositorio, probablemente pertenece a uno de los dos paquetes.

## El flujo de login

```
1. Persona entra a /login
2. Si ya hay sesión activa, se salta el formulario y se va directo al paso 4
3. Envía credenciales -> authService.login()
4. Según el rol de mayor alcance, se pide un código SSO para su audiencia:
   POST /api/v1/auth/sso/code  { audience: "admin" | "residente" | "vigilante" }
5. Redirige a <app-del-rol>/auth/sso/callback?code=...
6. Esa aplicación canjea el código desde su propio origen y recibe su cookie
```

El intercambio del código ocurre siempre desde el origen de destino, nunca desde aquí: las cookies de sesión son host-only (ver [ADR-001](https://github.com/GestionResidencialPoli/gr-user-microservice/blob/main/docs/decisiones/ADR-001-estrategia-tokens.md) en `gr-user-microservice`), así que `gr-auth-ui` no podría fijar una cookie válida para otra aplicación aunque lo intentara.

`features/auth/sso-redirect.ts` concentra esa decisión: qué audiencia le corresponde a cada combinación de roles (mismo orden de prioridad que `homeRouteFor` en `auth-client`: administración > vigilante > residente) y a qué origen redirigir. Es el único archivo que hay que tocar cuando `gr-residente-ui` o `gr-vigilante-ui` existan como repositorios propios.

### Dónde aterrizan hoy RESIDENTE y VIGILANTE

En `gr-common-ui`, porque `gr-residente-ui` y `gr-vigilante-ui` todavía no existen. **Eso exige que `gr-common-ui` tenga su propia página de callback de SSO**, espejo de la que ya tiene `gr-admin-ui` en `/auth/sso/callback` — sin esa página, un residente o vigilante que inicie sesión aquí no tiene dónde recibir su código. Es el trabajo inmediato siguiente a este repositorio.

## Recuperación de contraseña

- `/recuperar`: solicita `POST /api/v1/auth/password-reset` con `{ email }`. El backend responde `202` exista o no la cuenta — no hay forma de distinguirlo desde aquí, y es intencional.
- `/recuperar/confirmar?token=...`: confirma con `POST /api/v1/auth/password-reset/confirm`. El backend responde `400` tanto para un token inválido/expirado como para una contraseña que no cumple la política; se muestra el mensaje que el backend ya redacta en español en vez de adivinar cuál de los dos ocurrió.

Estas dos llamadas usan `apiFetch` directamente, no `authService`: el contrato compartido todavía no expone métodos de recuperación de contraseña. Promoverlos a `@gestionresidencial/auth-client` queda como mejora futura — no bloquea este repositorio, que ya es completamente funcional sin ella.

## Ejecutar

Usa Node.js 24 y pnpm 12.3.4.

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3002](http://localhost:3002). Corre en el puerto `3002` para no chocar con `gr-common-ui` (3000) ni `gr-admin-ui` (3001).

Copia `.env.example` a `.env.local` para apuntar a un backend o a otras aplicaciones de rol distintas de las predeterminadas.

**Requiere el backend activo** (`gr-user-microservice`) para autenticar de verdad; sin él, el formulario se muestra pero cualquier envío falla contra la red.

## Estructura

```text
app/
  login/                    Formulario de acceso
  recuperar/                Solicitar restablecimiento
  recuperar/confirmar/      Confirmar con el token del correo
features/auth/
  login-screen.tsx          Sesión, envío de credenciales, puente SSO
  password-reset-*          Las dos pantallas de recuperación
  sso-redirect.ts           Audiencia por rol y origen de destino
config/content.ts           Textos e identidad de marca
proxy.ts                    Reenvío limpio de /api hacia el backend
```

Todo aquí es público a propósito: login y recuperación de contraseña deben ser alcanzables sin sesión. `proxy.ts` no protege ninguna ruta, solo reenvía `/api/*`.

## Verificaciones automáticas

```bash
pnpm lint
pnpm test
pnpm build
```

`pnpm test` corre `tests/sso-redirect.test.mjs` con el runner de Node, sin red ni navegador: comprueba la audiencia y el origen de destino para cada rol, incluida la prioridad cuando alguien acumula varios.
