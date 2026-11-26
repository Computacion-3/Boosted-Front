import type { Metadata } from "next";
import { RegisterView } from "./register-view";

export const metadata: Metadata = { title: "Crear cuenta | Boosted" };

/**
 * /register. Quien ya tiene sesión no llega aquí: proxy.ts lo manda a HOME_ROUTE.
 * La página es de servidor y deja el formulario a la vista de cliente.
 */
export default function RegisterPage() {
  return <RegisterView />;
}
