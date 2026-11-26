import type { GarageRepository } from "../repositories/garage.repository";

export class GetVehicleDetailUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(id: string, userId: string) {
        return this.repository.detail(id, userId);
    }
}
