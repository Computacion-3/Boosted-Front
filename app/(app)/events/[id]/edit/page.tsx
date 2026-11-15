import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { EditEventView } from "./edit-event-view";

export const metadata: Metadata = { title: "Editar evento | Boosted" };

export default async function EditEventPage({ params }: PageProps<"/events/[id]/edit">) {
  await requireSession();
  const { id } = await params;
  return <EditEventView id={id} />;
}
