import { PlantStatus } from "../enums/PlantStatus";

export interface PlantFiltersTypes {
  status?: PlantStatus;
  minOilStrength?: number;
  maxOilStrength?: number;
  countryOfOrigin?: string;
}