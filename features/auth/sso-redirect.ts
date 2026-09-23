import type { Role } from "@gestionresidencial/auth-client";
import { apiFetch } from "@gestionresidencial/auth-client";

type Audience = "admin" | "residente" | "vigilante";

/**
 * Mismo orden de prioridad que DEFAULT_ROLE_HOME_ROUTES en auth-client:
 * quien acumula varios roles cruza por el de mayor alcance.
 */
function audienceFor(roles: Role[]): Audience {
  if (roles.includes("ADMINISTRACION")) return "admin";
  if (roles.includes("VIGILANTE")) return "vigilante";
  return "residente";
}

/**
 * RESIDENTE y VIGILANTE aterrizan hoy en gr-common-ui: gr-residente-ui y
 * gr-vigilante-ui todavia no existen como repositorios propios. Cuando
 * existan, solo cambia esta tabla -- el resto del flujo no se entera.
 */
function targetOriginFor(audience: Audience): string {
  if (audience === "admin") {
    return process.env.NEXT_PUBLIC_ADMIN_UI_URL || "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_COMMON_UI_URL || "http://localhost:3000";
}

/**
 * Pide el codigo SSO para la audiencia que corresponde al rol de mayor
 * alcance del usuario y redirige al callback de esa aplicacion. El
 * intercambio ocurre desde el origen de destino, no desde aqui: las cookies
 * de sesion son host-only (ADR-001 en gr-user-microservice), asi que
 * gr-auth-ui nunca podria fijar una cookie valida para otra aplicacion.
 */
export async function redirectViaSso(roles: Role[]): Promise<void> {
  const audience = audienceFor(roles);
  const { code } = await apiFetch<{ code: string }>("/api/v1/auth/sso/code", {
    method: "POST",
    body: { audience },
  });

  const callbackUrl = new URL(
    `/auth/sso/callback?code=${encodeURIComponent(code)}`,
    targetOriginFor(audience),
  );
  window.location.replace(callbackUrl.toString());
}
