import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { EventDetailView } from "./event-detail-view";

export const metadata: Metadata = { title: "Evento | Boosted" };

export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  await requireSession();
  const { id } = await params; // en Next 16 params es una promesa
  return <EventDetailView id={id} />;
}
