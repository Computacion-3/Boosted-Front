import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { EditPostView } from "./edit-post-view";

export const metadata: Metadata = { title: "Editar publicación | Boosted" };

/** Página de servidor: exige sesión y pasa el id a la vista de cliente. */
export default async function EditPostPage({ params }: PageProps<"/posts/[id]/edit">) {
  await requireSession();
  const { id } = await params;
  return <EditPostView id={id} />;
}
