import type { GarageRepository } from "../repositories/garage.repository";

export class ListVehiclesUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute() {
        return this.repository.list();
    }
}
