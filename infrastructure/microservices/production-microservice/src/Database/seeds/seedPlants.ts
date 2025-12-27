import { PlantStatus } from "../../Domain/enums/PlantStatus";

export const seedPlants = [
  { commonName: 'Lavanda', latinName: 'Lavandula angustifolia', originCountry: 'France', aromaticStrength: 3.50, status: PlantStatus.POSADJENA },
  { commonName: 'Ruza', latinName: 'Rosa damascena', originCountry: 'Bulgaria', aromaticStrength: 4.20, status: PlantStatus.POSADJENA },
  { commonName: 'Jasmin', latinName: 'Jasminum sambac', originCountry: 'India', aromaticStrength: 4.65, status: PlantStatus.POSADJENA },
  { commonName: 'Vetiver', latinName: 'Chrysopogon zizanioides', originCountry: 'Haiti', aromaticStrength: 3.10, status: PlantStatus.POSADJENA }
];
