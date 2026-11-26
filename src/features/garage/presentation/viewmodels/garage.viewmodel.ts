import type { GarageList, GarageDetail, Vehicle, Modification, JournalEntry } from "../../domain/entities/garage";

export type Visibility = "public" | "private";
export type ModificationStatus = "planned" | "in_progress" | "installed" | "removed";
export type EntryType = "progress" | "purchase" | "problem" | "goal";
export interface VehicleInput {
    brand: string;
    model: string;
    year: number;
    version?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    color?: string;
    horsepower?: number;
    torque?: number;
    consumption?: number;
    mileage?: number;
    description?: string;
    visibility?: Visibility;
}
export interface ModificationInput {
    name: string;
    category: string;
    brand?: string;
    partModel?: string;
    status?: ModificationStatus;
    installationDate?: string;
    partCost?: number;
    installationCost?: number;
    purchaseLocation?: string;
    notes?: string;
}
export interface JournalInput {
    title: string;
    content: string;
    type: EntryType;
    entryDate: string;
    modificationId?: string | null;
    expense?: number;
}
type Nullable<T> = {
    [K in keyof T]-?: T[K] | null;
};
export type VehicleViewModel = Nullable<VehicleInput> & {
    id: string;
    brand: string;
    model: string;
    year: number;
    visibility: Visibility;
};
export type ModificationViewModel = Nullable<ModificationInput> & {
    id: string;
    vehicleId: string;
    name: string;
    category: string;
    status: ModificationStatus;
    partCost: number;
    installationCost: number;
};
export type JournalEntryViewModel = Nullable<JournalInput> & {
    id: string;
    vehicleId: string;
    title: string;
    content: string;
    type: EntryType;
    entryDate: string;
    expense: number;
};
export interface ExpensesViewModel {
    vehicleId: string;
    currency: "COP";
    modificationExpenses: number;
    independentExpenses: number;
    totalInvested: number;
    plannedBudget: number;
}
export interface GarageListViewModel {
    mine: VehicleViewModel[];
    publicVehicles: VehicleViewModel[];
}
export interface GarageDetailViewModel {
    vehicle: VehicleViewModel;
    owned: boolean;
    modifications: ModificationViewModel[];
    journal: JournalEntryViewModel[];
    expenses: ExpensesViewModel | null;
}
export type Mutation = {
    kind: "vehicle";
    id?: string;
    values: VehicleInput;
} | {
    kind: "modification";
    vehicleId: string;
    id?: string;
    values: ModificationInput;
} | {
    kind: "journal";
    vehicleId: string;
    id?: string;
    values: JournalInput;
};
export type Removal = {
    kind: "vehicle";
    id: string;
} | {
    kind: "modification" | "journal";
    vehicleId: string;
    id: string;
};

function toVehicleViewModel(v: Vehicle): VehicleViewModel {
    return { id: v.id, brand: v.brand, model: v.model, year: v.year, version: v.version, engine: v.engine, transmission: v.transmission, drivetrain: v.drivetrain, color: v.color, horsepower: v.horsepower, torque: v.torque, consumption: v.consumption, mileage: v.mileage, description: v.description, visibility: v.visibility };
}
function toModificationViewModel(m: Modification): ModificationViewModel {
    return { id: m.id, vehicleId: m.vehicleId, name: m.name, category: m.category, brand: m.brand, partModel: m.partModel, status: m.status, installationDate: m.installationDate, partCost: m.partCost, installationCost: m.installationCost, purchaseLocation: m.purchaseLocation, notes: m.notes };
}
function toJournalViewModel(j: JournalEntry): JournalEntryViewModel {
    return { id: j.id, vehicleId: j.vehicleId, title: j.title, content: j.content, type: j.type, entryDate: j.entryDate, modificationId: j.modificationId, expense: j.expense };
}
export function toGarageListViewModel(list: GarageList): GarageListViewModel {
    return { mine: list.mine.map(toVehicleViewModel), publicVehicles: list.publicVehicles.map(toVehicleViewModel) };
}
export function toGarageDetailViewModel(d: GarageDetail): GarageDetailViewModel {
    const e = d.expenses;
    return { vehicle: toVehicleViewModel(d.vehicle), owned: d.owned, modifications: d.modifications.map(toModificationViewModel), journal: d.journal.map(toJournalViewModel), expenses: e ? { vehicleId: e.vehicleId, currency: e.currency, modificationExpenses: e.modificationExpenses, independentExpenses: e.independentExpenses, totalInvested: e.totalInvested, plannedBudget: e.plannedBudget } : null };
}

export const cop = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
export const statuses = { planned: "Planeada", in_progress: "En progreso", installed: "Instalada", removed: "Retirada" };
export const types = { progress: "Avance", purchase: "Compra", problem: "Problema", goal: "Objetivo" };
