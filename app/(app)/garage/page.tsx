import { requireSession } from "@/src/lib/dal";
import { GarageView } from "@/src/features/garage/presentation/components/GarageView";
export default async function GaragePage() { await requireSession(); return <GarageView />; }
