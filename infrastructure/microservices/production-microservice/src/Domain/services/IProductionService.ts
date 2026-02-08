import { Plant } from "../models/Plant";

export interface IProductionService {
  plantNew(commonName: string, latinName: string, originCountry: string): Promise<Plant>;
  changeAromaticStrengthPercent(plantId: string, percent: number): Promise<Plant | null>;
  harvestByLatinName(latinName: string, count: number): Promise<Plant[]>;
  processByLatinName(latinName: string, count: number): Promise<Plant[]>;
  listPlants(): Promise<Plant[]>;
}
