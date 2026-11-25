import type { GarageRepository } from "../../domain/repositories/garage.repository";
import type { Mutation, Removal } from "../../domain/entities/garage";
import type { GarageRestDatasource } from "../datasources/garage-rest-datasource";
import { mapVehicle, mapModification, mapJournal } from "../mappers/garage.mapper";
export class GarageRepositoryImpl implements GarageRepository {
    constructor(private readonly source: GarageRestDatasource) { }
    async list() { const [mine, publicVehicles] = await Promise.all([this.source.mine(), this.source.publicVehicles()]); return { mine: mine.map(mapVehicle), publicVehicles: publicVehicles.map(mapVehicle) }; }
    async detail(id: string, userId: string) { const vehicle = mapVehicle(await this.source.vehicle(id)); const owned = vehicle.ownerId === userId; const [mods, journal, expenses] = await Promise.all([this.source.modifications(id), this.source.journal(id), owned ? this.source.expenses(id) : Promise.resolve(null)]); return { vehicle, owned, modifications: mods.map(mapModification), journal: journal.map(mapJournal), expenses }; }
    save(m: Mutation) { return this.source.save(m); }
    remove(m: Removal) { return this.source.remove(m); }
}
