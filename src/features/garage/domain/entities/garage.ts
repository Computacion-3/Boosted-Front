import { DomainError } from "@/src/core/errors/domain-error";
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
export type Vehicle = Nullable<VehicleInput> & {
    id: string;
    ownerId: string;
    brand: string;
    model: string;
    year: number;
    visibility: Visibility;
};
export type Modification = Nullable<ModificationInput> & {
    id: string;
    vehicleId: string;
    name: string;
    category: string;
    status: ModificationStatus;
    partCost: number;
    installationCost: number;
};
export type JournalEntry = Nullable<JournalInput> & {
    id: string;
    vehicleId: string;
    title: string;
    content: string;
    type: EntryType;
    entryDate: string;
    expense: number;
};
export interface Expenses {
    vehicleId: string;
    currency: "COP";
    modificationExpenses: number;
    independentExpenses: number;
    totalInvested: number;
    plannedBudget: number;
}
export interface GarageList {
    mine: Vehicle[];
    publicVehicles: Vehicle[];
}
export interface GarageDetail {
    vehicle: Vehicle;
    owned: boolean;
    modifications: Modification[];
    journal: JournalEntry[];
    expenses: Expenses | null;
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
export function validateMutation(m: Mutation) {
    const text = (v: string, max: number) => { if (typeof v !== "string" || !v.trim() || v.trim().length > max)
        throw new DomainError(`Texto obligatorio de máximo ${max} caracteres.`); };
    const money = (v: number | undefined) => { if (v !== undefined && (!Number.isInteger(v) || v < 0 || v > 2147483647))
        throw new DomainError("El gasto debe ser un entero COP no negativo válido."); };
    if (m.kind === "vehicle") {
        const v = m.values;
        text(v.brand, 60);
        text(v.model, 80);
        if (!Number.isInteger(v.year) || v.year < 1886 || v.year > new Date().getFullYear() + 1)
            throw new DomainError("Año inválido.");
        for (const n of [v.horsepower, v.torque, v.consumption, v.mileage])
            if (n !== undefined && (!Number.isFinite(n) || n < 0))
                throw new DomainError("Las medidas deben ser positivas.");
        money(v.mileage);
    }
    if (m.kind === "modification") {
        text(m.values.name, 120);
        text(m.values.category, 60);
        money(m.values.partCost);
        money(m.values.installationCost);
    }
    if (m.kind === "journal") {
        text(m.values.title, 120);
        text(m.values.content, 5000);
        money(m.values.expense);
        if (m.values.modificationId && (m.values.expense ?? 0) > 0)
            throw new DomainError("Una entrada vinculada debe tener gasto cero.");
    }
}
