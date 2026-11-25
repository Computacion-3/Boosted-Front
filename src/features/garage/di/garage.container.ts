import "server-only";
import { GarageUseCases } from "../domain/usecases/garage.usecases";
import { GarageRepositoryImpl } from "../infrastructure/repositories/garage.repository.impl";
import { GarageRestDatasource } from "../infrastructure/datasources/garage-rest-datasource";
export const garageContainer = new GarageUseCases(new GarageRepositoryImpl(new GarageRestDatasource()));
