import type { Mutation, Removal } from "../../domain/entities/garage";
import type { VehicleDto, ModificationDto, JournalDto, ExpensesDto } from "../dtos/garage.dto";

export interface GarageDatasource {
    mine(): Promise<VehicleDto[]>;
    publicVehicles(): Promise<VehicleDto[]>;
    vehicle(id: string): Promise<VehicleDto>;
    modifications(id: string): Promise<ModificationDto[]>;
    journal(id: string): Promise<JournalDto[]>;
    expenses(id: string): Promise<ExpensesDto>;
    save(mutation: Mutation): Promise<string>;
    remove(removal: Removal): Promise<void>;
}
