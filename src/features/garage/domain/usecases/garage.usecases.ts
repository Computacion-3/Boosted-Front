import { validateMutation, type Mutation, type Removal } from "../entities/garage";
import type { GarageRepository } from "../repositories/garage.repository";
export class GarageUseCases {
    constructor(private readonly repository: GarageRepository) { }
    list() { return this.repository.list(); }
    detail(id: string, userId: string) { return this.repository.detail(id, userId); }
    save(m: Mutation) { validateMutation(m); return this.repository.save(m); }
    remove(m: Removal) { return this.repository.remove(m); }
}
