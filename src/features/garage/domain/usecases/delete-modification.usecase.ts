import type { GarageRepository } from "../repositories/garage.repository";

export class DeleteModificationUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: { kind: "modification"; vehicleId: string; id: string }) {
        return this.repository.remove(input);
    }
}
