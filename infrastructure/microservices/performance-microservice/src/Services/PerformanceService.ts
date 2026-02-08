import { Repository } from "typeorm";
import {
  IPerformanceService,
  SimulationParams,
  SimulationResult,
  AlgorithmResult,
} from "../Domain/services/IPerformanceService";
import { PerformanceReport } from "../Domain/models/PerformanceReport";
import { sendAuditLog } from "../utils/AuditClient";

export class PerformanceService implements IPerformanceService {
  constructor(
    private readonly reportRepo: Repository<PerformanceReport>
  ) {}

  async runSimulation(params: SimulationParams): Promise<SimulationResult> {
    const { packageCount } = params;

    // DistributionCenter: 3 per turn, 0.5s delay
    const dcPackagesPerTurn = 3;
    const dcDelay = 0.5;
    const dcTotalTurns = Math.ceil(packageCount / dcPackagesPerTurn);
    const dcTotalTime = dcTotalTurns * dcDelay;
    const dcThroughput = dcTotalTime > 0 ? packageCount / dcTotalTime : 0;

    const distributionCenter: AlgorithmResult = {
      algorithmName: "DistributionCenter",
      packageCount,
      packagesPerTurn: dcPackagesPerTurn,
      delayPerTurn: dcDelay,
      totalTurns: dcTotalTurns,
      totalTime: dcTotalTime,
      throughput: Math.round(dcThroughput * 100) / 100,
    };

    // WarehouseCenter: 1 per turn, 2.5s delay
    const wcPackagesPerTurn = 1;
    const wcDelay = 2.5;
    const wcTotalTurns = packageCount;
    const wcTotalTime = wcTotalTurns * wcDelay;
    const wcThroughput = wcTotalTime > 0 ? packageCount / wcTotalTime : 0;

    const warehouseCenter: AlgorithmResult = {
      algorithmName: "WarehouseCenter",
      packageCount,
      packagesPerTurn: wcPackagesPerTurn,
      delayPerTurn: wcDelay,
      totalTurns: wcTotalTurns,
      totalTime: wcTotalTime,
      throughput: Math.round(wcThroughput * 100) / 100,
    };

    // Calculate efficiency difference
    const efficiencyDiff =
      wcTotalTime > 0
        ? Math.round(((wcTotalTime - dcTotalTime) / wcTotalTime) * 10000) / 100
        : 0;

    const conclusion = `DistributionCenter je ${efficiencyDiff}% brži za ${packageCount} ambalaža. Preporuka: koristiti DistributionCenter za veće količine.`;

    // Save both results as PerformanceReport
    const dcReport = this.reportRepo.create({
      algorithmName: "DistributionCenter",
      simulationParams: { packageCount },
      results: JSON.stringify(distributionCenter),
      conclusion,
    });

    const wcReport = this.reportRepo.create({
      algorithmName: "WarehouseCenter",
      simulationParams: { packageCount },
      results: JSON.stringify(warehouseCenter),
      conclusion,
    });

    const savedDc = await this.reportRepo.save(dcReport);
    const savedWc = await this.reportRepo.save(wcReport);

    sendAuditLog("INFO", `Performance: simulacija za ${packageCount} ambalaža. DC=${dcTotalTime}s, WC=${wcTotalTime}s, razlika=${efficiencyDiff}%`);

    return {
      distributionCenter,
      warehouseCenter,
      efficiencyDiff,
      conclusion,
      reports: [savedDc, savedWc],
    };
  }

  async listReports(): Promise<PerformanceReport[]> {
    return this.reportRepo.find({ order: { createdAt: "DESC" } });
  }

  async getReportById(id: string): Promise<PerformanceReport | null> {
    return this.reportRepo.findOne({ where: { id } });
  }
}
