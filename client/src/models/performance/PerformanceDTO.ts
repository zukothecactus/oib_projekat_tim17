export interface AlgorithmResultDTO {
  algorithmName: string;
  packageCount: number;
  packagesPerTurn: number;
  delayPerTurn: number;
  totalTurns: number;
  totalTime: number;
  throughput: number;
}

export interface SimulationResultDTO {
  distributionCenter: AlgorithmResultDTO;
  warehouseCenter: AlgorithmResultDTO;
  efficiencyDiff: number;
  conclusion: string;
  reports: PerformanceReportDTO[];
}

export interface PerformanceReportDTO {
  id: string;
  algorithmName: string;
  simulationParams: { packageCount: number };
  results: string; // JSON string of AlgorithmResultDTO
  conclusion: string;
  createdAt: string;
}
