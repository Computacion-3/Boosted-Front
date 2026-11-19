import type { Metadata } from "next";
import { LoginView } from "./login-view";

export const metadata: Metadata = { title: "Iniciar sesión | Boosted" };

/**
 * /login. Quien ya tiene sesión no llega aquí: proxy.ts lo manda a HOME_ROUTE.
 * La página es de servidor y deja el formulario a la vista de cliente.
 */
export default function LoginPage() {
  return <LoginView />;
}
