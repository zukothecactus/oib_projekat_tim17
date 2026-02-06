export type PlantStatus = "POSADJENA" | "UBRANA" | "PRERADJENA";

export type PlantDTO = {
  id: string;
  commonName: string;
  latinName: string;
  originCountry: string;
  aromaticStrength: number;
  status: PlantStatus;
  createdAt: string;
};
