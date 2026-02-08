import { PerformanceReport } from "../models/PerformanceReport";

export interface SimulationParams {
  packageCount: number;
}

export interface AlgorithmResult {
  algorithmName: string;
  packageCount: number;
  packagesPerTurn: number;
  delayPerTurn: number;
  totalTurns: number;
  totalTime: number;
  throughput: number; // packages/sec
}

export interface SimulationResult {
  distributionCenter: AlgorithmResult;
  warehouseCenter: AlgorithmResult;
  efficiencyDiff: number; // difference in %
  conclusion: string;
  reports: PerformanceReport[];
}

export interface IPerformanceService {
  runSimulation(params: SimulationParams): Promise<SimulationResult>;
  listReports(): Promise<PerformanceReport[]>;
  getReportById(id: string): Promise<PerformanceReport | null>;
}
