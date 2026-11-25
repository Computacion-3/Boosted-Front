import "server-only";
import { apiClient } from "@/src/core/http/api-client";
import type { Mutation, Removal } from "../../domain/entities/garage";
import type { VehicleDto, ModificationDto, JournalDto, ExpensesDto } from "../dtos/garage.dto";
const path = (id: string) => `/vehicles/${encodeURIComponent(id)}`;
function resource(m: Mutation | Removal) { return m.kind === "vehicle" ? "/vehicles" : `${path(m.vehicleId)}/${m.kind === "modification" ? "modifications" : "build-journal"}`; }
export class GarageRestDatasource {
    mine() { return apiClient.get<VehicleDto[]>("/vehicles/me"); }
    publicVehicles() { return apiClient.get<VehicleDto[]>("/vehicles"); }
    vehicle(id: string) { return apiClient.get<VehicleDto>(path(id)); }
    modifications(id: string) { return apiClient.get<ModificationDto[]>(`${path(id)}/modifications`); }
    journal(id: string) { return apiClient.get<JournalDto[]>(`${path(id)}/build-journal`); }
    expenses(id: string) { return apiClient.get<ExpensesDto>(`${path(id)}/build-journal/expenses`); }
    async save(m: Mutation) { const p = resource(m); const result = m.id ? await apiClient.patch<{
        id: string;
    }>(`${p}/${encodeURIComponent(m.id)}`, m.values) : await apiClient.post<{
        id: string;
    }>(p, m.values); return result.id; }
    async remove(m: Removal) { await apiClient.delete(`${resource(m)}/${encodeURIComponent(m.id)}`); }
}
