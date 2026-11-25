import { requireSession } from "@/src/lib/dal";
import { GarageDetailView } from "@/src/features/garage/presentation/components/GarageDetailView";
export default async function GarageDetailPage({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { await requireSession(); const { id } = await params; return <GarageDetailView id={id}/>; }
