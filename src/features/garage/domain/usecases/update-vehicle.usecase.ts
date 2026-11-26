import { validateMutation, type Mutation } from "../entities/garage";
import type { GarageRepository } from "../repositories/garage.repository";

export class UpdateVehicleUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: Extract<Mutation, { kind: "vehicle" }> & { id: string }) {
        validateMutation(input);
        return this.repository.save(input);
    }
}
