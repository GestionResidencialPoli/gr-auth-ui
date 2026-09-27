import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { HEADERS_TO_STRIP_ON_FORWARD } from "@gestionresidencial/auth-client";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  HEADERS_TO_STRIP_ON_FORWARD.forEach((header) => headers.delete(header));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/:path*"],
};
