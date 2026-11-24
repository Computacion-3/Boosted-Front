import type { Metadata } from "next";
import { requireSession } from "@/src/lib/dal";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "Mi perfil | Boosted" };

export default async function ProfilePage() {
  await requireSession();
  return <ProfileView />;
}
