import { PlantDTO } from "../../models/plants/PlantDTO";

export interface IPlantAPI {
  getAllPlants(token: string): Promise<PlantDTO[]>;
  getPlantById(id: number, token: string): Promise<PlantDTO>;
  createPlant(plant: PlantDTO, token: string): Promise<PlantDTO>;
  updatePlant(id: number, plant: PlantDTO, token: string): Promise<PlantDTO>;
  deletePlant(id: number, token: string): Promise<void>;
}