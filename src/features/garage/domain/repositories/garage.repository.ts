import type { GarageList, GarageDetail, Mutation, Removal } from "../entities/garage";
export interface GarageRepository {
    list(): Promise<GarageList>;
    detail(id: string, userId: string): Promise<GarageDetail>;
    save(m: Mutation): Promise<string>;
    remove(m: Removal): Promise<void>;
}
