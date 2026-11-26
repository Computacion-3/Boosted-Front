import { validateMutation, type Mutation } from "../entities/garage";
import type { GarageRepository } from "../repositories/garage.repository";

export class CreateVehicleUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: Extract<Mutation, { kind: "vehicle" }>) {
        validateMutation(input);
        return this.repository.save({ ...input, id: undefined });
    }
}
