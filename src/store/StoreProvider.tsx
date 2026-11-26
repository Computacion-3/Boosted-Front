"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";

// react-redux usa React Context, que solo funciona en Client Components.
// Por eso este componente es 'use client' y el layout raíz (Server Component)
// solo lo monta alrededor de children.
export function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState con la función (sin llamarla) crea el store una sola vez:
  // React ejecuta makeStore en el primer render y lo conserva en los siguientes.
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
