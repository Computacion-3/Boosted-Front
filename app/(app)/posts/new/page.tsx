import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { NewPostView } from "./new-post-view";

export const metadata: Metadata = { title: "Nueva publicación | Boosted" };

/** Página de servidor: exige sesión y deja el formulario a la vista de cliente. */
export default async function NewPostPage() {
  await requireSession();
  return <NewPostView />;
}
