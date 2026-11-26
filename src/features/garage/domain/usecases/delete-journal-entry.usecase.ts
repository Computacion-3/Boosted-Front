import type { GarageRepository } from "../repositories/garage.repository";

export class DeleteJournalEntryUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: { kind: "journal"; vehicleId: string; id: string }) {
        return this.repository.remove(input);
    }
}
