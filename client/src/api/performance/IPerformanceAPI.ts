import { SimulationResultDTO, PerformanceReportDTO } from "../../models/performance/PerformanceDTO";

export interface IPerformanceAPI {
  runSimulation(token: string, packageCount: number): Promise<SimulationResultDTO>;
  listReports(token: string): Promise<PerformanceReportDTO[]>;
  getReportById(token: string, id: string): Promise<PerformanceReportDTO>;
}
