import type { Role } from "@gestionresidencial/auth-client";
import { apiFetch } from "@gestionresidencial/auth-client";

type Audience = "admin" | "residente" | "vigilante";

function audienceFor(roles: Role[]): Audience {
  if (roles.includes("ADMINISTRACION")) return "admin";
  if (roles.includes("VIGILANTE")) return "vigilante";
  return "residente";
}

function targetOriginFor(audience: Audience): string {
  if (audience === "admin") {
    return process.env.NEXT_PUBLIC_ADMIN_UI_URL || "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_COMMON_UI_URL || "http://localhost:3000";
}

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
