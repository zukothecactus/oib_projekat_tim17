import { WarehouseDTO } from "../../models/storage/WarehouseDTO";
import { StoredPackageDTO } from "../../models/storage/StoredPackageDTO";

export interface IStorageAPI {
  listWarehouses(token: string): Promise<WarehouseDTO[]>;
  getWarehousePackages(warehouseId: string, token: string): Promise<StoredPackageDTO[]>;
  receivePackage(warehouseId: string, packageData: any, token: string): Promise<StoredPackageDTO>;
  sendToSales(count: number, token: string): Promise<StoredPackageDTO[]>;
}
