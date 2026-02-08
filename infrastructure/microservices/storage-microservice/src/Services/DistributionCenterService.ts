import { Repository } from "typeorm";
import { IStorageService } from "../Domain/services/IStorageService";
import { Warehouse } from "../Domain/models/Warehouse";
import { StoredPackage } from "../Domain/models/StoredPackage";
import { v4 as uuidv4 } from "uuid";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * DistributionCenterService — sends up to 3 packages per call,
 * with a 0.5s delay per package. Used when the user role is SALES_MANAGER.
 */
export class DistributionCenterService implements IStorageService {
  constructor(
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly storedPkgRepo: Repository<StoredPackage>
  ) {}

  async sendToSales(count: number): Promise<StoredPackage[]> {
    const limit = Math.min(count, 3);

    const packages = await this.storedPkgRepo.find({
      where: { isDispatched: false },
      take: limit,
    });

    const dispatched: StoredPackage[] = [];

    for (const pkg of packages) {
      await sleep(500);
      pkg.isDispatched = true;
      const saved = await this.storedPkgRepo.save(pkg);
      dispatched.push(saved);
    }

    return dispatched;
  }

  async receivePackage(warehouseId: string, packageData: any): Promise<StoredPackage> {
    const pkg = this.storedPkgRepo.create({
      packageId: uuidv4(),
      warehouseId,
      packageData,
      isDispatched: false,
    });
    return this.storedPkgRepo.save(pkg);
  }

  async listWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepo.find();
  }

  async getWarehousePackages(warehouseId: string): Promise<StoredPackage[]> {
    return this.storedPkgRepo.find({ where: { warehouseId } });
  }
}
