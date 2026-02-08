import "reflect-metadata";
import dotenv from "dotenv";
import { Db } from "../DbConnectionPool";
import { Warehouse } from "../../Domain/models/Warehouse";
import { StoredPackage } from "../../Domain/models/StoredPackage";

dotenv.config();

async function seed() {
  try {
    await Db.initialize();
    console.log("[Seed] Database connected");

    const warehouseRepo = Db.getRepository(Warehouse);
    const storedPkgRepo = Db.getRepository(StoredPackage);

    // Clear existing data
    await storedPkgRepo.clear();
    await warehouseRepo.clear();

    // Seed warehouses
    const warehouses = warehouseRepo.create([
      { name: "Centralno skladište", location: "Pariz", maxCapacity: 50 },
      { name: "Skladište Sever", location: "Lion", maxCapacity: 30 },
      { name: "Skladište Jug", location: "Marsej", maxCapacity: 40 },
    ]);
    const savedWarehouses = await warehouseRepo.save(warehouses);
    console.log(`[Seed] Inserted ${savedWarehouses.length} warehouses`);

    // Seed stored packages (7 packages distributed across warehouses)
    const packages = storedPkgRepo.create([
      { packageId: "PKG-001", warehouseId: savedWarehouses[0].id, packageData: { name: "Rosa Mistika", volume: 250, count: 12 }, isDispatched: false },
      { packageId: "PKG-002", warehouseId: savedWarehouses[0].id, packageData: { name: "Lavander Noir", volume: 150, count: 18 }, isDispatched: false },
      { packageId: "PKG-003", warehouseId: savedWarehouses[0].id, packageData: { name: "Bergamot Esenc", volume: 250, count: 10 }, isDispatched: true },
      { packageId: "PKG-004", warehouseId: savedWarehouses[1].id, packageData: { name: "Jasmin De Nuj", volume: 150, count: 16 }, isDispatched: false },
      { packageId: "PKG-005", warehouseId: savedWarehouses[1].id, packageData: { name: "Rosa Mistika", volume: 250, count: 8 }, isDispatched: false },
      { packageId: "PKG-006", warehouseId: savedWarehouses[2].id, packageData: { name: "Lavander Noir", volume: 150, count: 20 }, isDispatched: true },
      { packageId: "PKG-007", warehouseId: savedWarehouses[2].id, packageData: { name: "Bergamot Esenc", volume: 250, count: 14 }, isDispatched: false },
    ]);
    const savedPackages = await storedPkgRepo.save(packages);
    console.log(`[Seed] Inserted ${savedPackages.length} stored packages`);

    console.log("[Seed] Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error:", err);
    process.exit(1);
  }
}

seed();
