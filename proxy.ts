import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HEADERS_TO_STRIP_ON_FORWARD } from "@gestionresidencial/auth-client";

/**
 * Toda esta aplicacion es publica: login y recuperacion de contrasena deben
 * ser alcanzables sin sesion, no hay nada que proteger. El unico trabajo del
 * proxy es reenviar /api/* al backend limpiando las cabeceras del origen,
 * igual que en gr-common-ui y gr-admin-ui.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  HEADERS_TO_STRIP_ON_FORWARD.forEach((header) => headers.delete(header));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/:path*"],
};
