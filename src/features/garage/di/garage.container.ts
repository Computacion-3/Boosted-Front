import "server-only";
import { ListVehiclesUseCase } from "../domain/usecases/list-vehicles.usecase";
import { GetVehicleDetailUseCase } from "../domain/usecases/get-vehicle-detail.usecase";
import { CreateVehicleUseCase } from "../domain/usecases/create-vehicle.usecase";
import { UpdateVehicleUseCase } from "../domain/usecases/update-vehicle.usecase";
import { DeleteVehicleUseCase } from "../domain/usecases/delete-vehicle.usecase";
import { CreateModificationUseCase } from "../domain/usecases/create-modification.usecase";
import { UpdateModificationUseCase } from "../domain/usecases/update-modification.usecase";
import { DeleteModificationUseCase } from "../domain/usecases/delete-modification.usecase";
import { CreateJournalEntryUseCase } from "../domain/usecases/create-journal-entry.usecase";
import { UpdateJournalEntryUseCase } from "../domain/usecases/update-journal-entry.usecase";
import { DeleteJournalEntryUseCase } from "../domain/usecases/delete-journal-entry.usecase";
import { GarageRepositoryImpl } from "../infrastructure/repositories/garage.repository.impl";
import { GarageRestDatasource } from "../infrastructure/datasources/garage-rest-datasource";

const repository = new GarageRepositoryImpl(new GarageRestDatasource());
export const garageContainer = {
    listVehicles: new ListVehiclesUseCase(repository),
    getVehicleDetail: new GetVehicleDetailUseCase(repository),
    createVehicle: new CreateVehicleUseCase(repository),
    updateVehicle: new UpdateVehicleUseCase(repository),
    deleteVehicle: new DeleteVehicleUseCase(repository),
    createModification: new CreateModificationUseCase(repository),
    updateModification: new UpdateModificationUseCase(repository),
    deleteModification: new DeleteModificationUseCase(repository),
    createJournalEntry: new CreateJournalEntryUseCase(repository),
    updateJournalEntry: new UpdateJournalEntryUseCase(repository),
    deleteJournalEntry: new DeleteJournalEntryUseCase(repository),
};
