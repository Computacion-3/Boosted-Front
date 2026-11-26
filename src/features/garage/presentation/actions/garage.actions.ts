"use server";
import { requireSession } from "@/src/lib/dal";
import { actionOk, toActionError } from "@/src/core/errors/action-result";
import { garageContainer } from "../../di/garage.container";
import type { Mutation, Removal } from "../../domain/entities/garage";
export async function listGarageAction() { await requireSession(); try {
    return actionOk(await garageContainer.listVehicles.execute());
}
catch (e) {
    return toActionError(e);
} }
export async function detailGarageAction(id: string) { const session = await requireSession(); try {
    return actionOk(await garageContainer.getVehicleDetail.execute(id, session.userId));
}
catch (e) {
    return toActionError(e);
} }
export async function saveGarageAction(m: Mutation) { await requireSession(); try {
    let id: string;
    switch (m.kind) {
        case "vehicle": id = m.id ? await garageContainer.updateVehicle.execute({ ...m, id: m.id }) : await garageContainer.createVehicle.execute(m); break;
        case "modification": id = m.id ? await garageContainer.updateModification.execute({ ...m, id: m.id }) : await garageContainer.createModification.execute(m); break;
        case "journal": id = m.id ? await garageContainer.updateJournalEntry.execute({ ...m, id: m.id }) : await garageContainer.createJournalEntry.execute(m); break;
    }
    return actionOk(id);
}
catch (e) {
    return toActionError(e);
} }
export async function removeGarageAction(m: Removal) { await requireSession(); try {
    switch (m.kind) {
        case "vehicle": await garageContainer.deleteVehicle.execute(m); break;
        case "modification": await garageContainer.deleteModification.execute({ ...m, kind: "modification" }); break;
        case "journal": await garageContainer.deleteJournalEntry.execute({ ...m, kind: "journal" }); break;
    }
    return actionOk(true);
}
catch (e) {
    return toActionError(e);
} }
