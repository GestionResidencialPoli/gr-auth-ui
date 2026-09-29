import type { NextConfig } from "next";

// El gateway es el único origen de API expuesto al navegador.
const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  // @gestionresidencial/shared-ui y @gestionresidencial/auth-client se
  // distribuyen construidos (ESM + tipos en dist/), no necesitan transpilarse.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backendApiUrl}/api/v1/:path*` }];
  },
};

export default nextConfig;
