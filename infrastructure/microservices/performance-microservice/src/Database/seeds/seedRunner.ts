import "reflect-metadata";
import dotenv from "dotenv";
import { Db } from "../DbConnectionPool";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";

dotenv.config();

async function seed() {
  try {
    await Db.initialize();
    console.log("[Seed] Database connected");

    const reportRepo = Db.getRepository(PerformanceReport);

    // Clear existing data
    await reportRepo.clear();

    // Seed simulation 1: 30 packages
    const sim1Dc = {
      algorithmName: "DistributionCenter",
      packageCount: 30,
      packagesPerTurn: 3,
      delayPerTurn: 0.5,
      totalTurns: 10,
      totalTime: 5,
      throughput: 6,
    };
    const sim1Wc = {
      algorithmName: "WarehouseCenter",
      packageCount: 30,
      packagesPerTurn: 1,
      delayPerTurn: 2.5,
      totalTurns: 30,
      totalTime: 75,
      throughput: 0.4,
    };
    const conclusion1 = "DistributionCenter je 93.33% brži za 30 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.";

    // Seed simulation 2: 100 packages
    const sim2Dc = {
      algorithmName: "DistributionCenter",
      packageCount: 100,
      packagesPerTurn: 3,
      delayPerTurn: 0.5,
      totalTurns: 34,
      totalTime: 17,
      throughput: 5.88,
    };
    const sim2Wc = {
      algorithmName: "WarehouseCenter",
      packageCount: 100,
      packagesPerTurn: 1,
      delayPerTurn: 2.5,
      totalTurns: 100,
      totalTime: 250,
      throughput: 0.4,
    };
    const conclusion2 = "DistributionCenter je 93.2% brži za 100 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.";

    // Seed simulation 3: 10 packages
    const sim3Dc = {
      algorithmName: "DistributionCenter",
      packageCount: 10,
      packagesPerTurn: 3,
      delayPerTurn: 0.5,
      totalTurns: 4,
      totalTime: 2,
      throughput: 5,
    };
    const sim3Wc = {
      algorithmName: "WarehouseCenter",
      packageCount: 10,
      packagesPerTurn: 1,
      delayPerTurn: 2.5,
      totalTurns: 10,
      totalTime: 25,
      throughput: 0.4,
    };
    const conclusion3 = "DistributionCenter je 92% brži za 10 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.";

    const reports = reportRepo.create([
      {
        algorithmName: "DistributionCenter",
        simulationParams: { packageCount: 30 },
        results: JSON.stringify(sim1Dc),
        conclusion: conclusion1,
      },
      {
        algorithmName: "WarehouseCenter",
        simulationParams: { packageCount: 30 },
        results: JSON.stringify(sim1Wc),
        conclusion: conclusion1,
      },
      {
        algorithmName: "DistributionCenter",
        simulationParams: { packageCount: 100 },
        results: JSON.stringify(sim2Dc),
        conclusion: conclusion2,
      },
      {
        algorithmName: "WarehouseCenter",
        simulationParams: { packageCount: 100 },
        results: JSON.stringify(sim2Wc),
        conclusion: conclusion2,
      },
      {
        algorithmName: "DistributionCenter",
        simulationParams: { packageCount: 10 },
        results: JSON.stringify(sim3Dc),
        conclusion: conclusion3,
      },
      {
        algorithmName: "WarehouseCenter",
        simulationParams: { packageCount: 10 },
        results: JSON.stringify(sim3Wc),
        conclusion: conclusion3,
      },
    ]);

    const saved = await reportRepo.save(reports);
    console.log(`[Seed] Inserted ${saved.length} performance reports (3 simulations × 2 algorithms)`);
    console.log("[Seed] Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error:", err);
    process.exit(1);
  }
}

seed();
