import type { Vehicle, Modification, JournalEntry, Expenses } from "../../domain/entities/garage";
export type VehicleDto = Vehicle & {
    createdAt: string;
    updatedAt: string;
};
export type ModificationDto = Modification & {
    createdAt: string;
    updatedAt: string;
};
export type JournalDto = JournalEntry & {
    createdAt: string;
    updatedAt: string;
};
export type ExpensesDto = Expenses;
