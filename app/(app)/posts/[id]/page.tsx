import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { PostDetailView } from "./post-detail-view";

export const metadata: Metadata = { title: "Publicación | Boosted" };

/** Página de servidor: exige sesión y pasa el id a la vista de cliente. */
export default async function PostDetailPage({ params }: PageProps<"/posts/[id]">) {
  await requireSession();
  const { id } = await params; // en Next 16 params es una promesa
  return <PostDetailView id={id} />;
}
