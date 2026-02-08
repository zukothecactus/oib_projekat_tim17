import { Package } from "../models/Package";

export interface IPackagingService {
  packPerfumes(data: {
    name: string;
    senderAddress: string;
    perfumeType: string;
    count: number;
    perfumeIds?: string[];
  }): Promise<Package>;

  sendToWarehouse(packageId: string, warehouseId: string): Promise<Package>;

  listPackages(): Promise<Package[]>;

  getPackageById(id: string): Promise<Package>;
}
