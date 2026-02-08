import { PackageDTO } from "../../models/packaging/PackageDTO";

export interface IPackagingAPI {
  packPerfumes(
    data: { name: string; senderAddress: string; perfumeType: string; count: number; perfumeIds?: string[] },
    token: string
  ): Promise<PackageDTO>;

  sendToWarehouse(
    data: { packageId: string; warehouseId: string },
    token: string
  ): Promise<PackageDTO>;

  listPackages(token: string): Promise<PackageDTO[]>;

  getPackageById(id: string, token: string): Promise<PackageDTO>;
}
