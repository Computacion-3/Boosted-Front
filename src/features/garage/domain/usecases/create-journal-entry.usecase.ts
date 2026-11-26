import { validateMutation, type Mutation } from "../entities/garage";
import type { GarageRepository } from "../repositories/garage.repository";

export class CreateJournalEntryUseCase {
    constructor(private readonly repository: GarageRepository) {}
    execute(input: Extract<Mutation, { kind: "journal" }>) {
        validateMutation(input);
        return this.repository.save({ ...input, id: undefined });
    }
}
