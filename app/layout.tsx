import type { Metadata } from "next";
import "@gestionresidencial/shared-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Acceso | Habitar", template: "%s | Habitar" },
  description: "Inicio de sesión y recuperación de acceso para Gestión Residencial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
