import { PlantDTO } from "../../models/plants/PlantDTO";

export interface IPlantAPI {
  listPlants(token: string): Promise<PlantDTO[]>;
  plantNew(
    data: { commonName: string; latinName: string; originCountry: string },
    token: string
  ): Promise<PlantDTO>;
  changeStrength(
    plantId: string,
    percent: number,
    token: string
  ): Promise<PlantDTO>;
  harvest(
    latinName: string,
    count: number,
    token: string
  ): Promise<PlantDTO[]>;
}