import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { EventsView } from "./events-view";

export const metadata: Metadata = { title: "Eventos | Boosted" };

/** Página de servidor: exige sesión y deja el resto a la vista de cliente. */
export default async function EventsPage() {
  await requireSession();
  return <EventsView />;
}
