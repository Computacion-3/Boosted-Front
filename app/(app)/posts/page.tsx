import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { PostsView } from "./posts-view";

export const metadata: Metadata = { title: "Comunidad | Boosted" };

/** Página de servidor: exige sesión y deja el resto a la vista de cliente. */
export default async function PostsPage() {
  await requireSession();
  return <PostsView />;
}
