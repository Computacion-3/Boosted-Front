"use server";
import { requireSession } from "@/src/lib/dal";
import { actionOk, toActionError } from "@/src/core/errors/action-result";
import { garageContainer } from "../../di/garage.container";
import type { Mutation, Removal } from "../../domain/entities/garage";
export async function listGarageAction() { await requireSession(); try {
    return actionOk(await garageContainer.list());
}
catch (e) {
    return toActionError(e);
} }
export async function detailGarageAction(id: string) { const session = await requireSession(); try {
    return actionOk(await garageContainer.detail(id, session.userId));
}
catch (e) {
    return toActionError(e);
} }
export async function saveGarageAction(m: Mutation) { await requireSession(); try {
    return actionOk(await garageContainer.save(m));
}
catch (e) {
    return toActionError(e);
} }
export async function removeGarageAction(m: Removal) { await requireSession(); try {
    await garageContainer.remove(m);
    return actionOk(true);
}
catch (e) {
    return toActionError(e);
} }
