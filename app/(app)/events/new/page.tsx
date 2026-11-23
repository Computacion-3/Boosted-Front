import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { NewEventView } from "./new-event-view";

export const metadata: Metadata = { title: "Crear evento | Boosted" };

/** Cualquier persona con sesión puede crear eventos (el creador sale del token). */
export default async function NewEventPage() {
  await requireSession();
  return <NewEventView />;
}
