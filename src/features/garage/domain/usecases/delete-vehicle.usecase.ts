import type { Removal } from "../entities/garage";
import type { GarageRepository } from "../repositories/garage.repository";

export class DeleteVehicleUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: Extract<Removal, { kind: "vehicle" }>) {
        return this.repository.remove(input);
    }
}
