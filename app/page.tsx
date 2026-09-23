import { redirect } from "next/navigation";

/**
 * /login decide si hay que mostrar el formulario o saltar directo al puente
 * SSO (revisa la sesion al montar), asi que la raiz solo reenvia ahi.
 */
export default function RootPage() {
  redirect("/login");
}
