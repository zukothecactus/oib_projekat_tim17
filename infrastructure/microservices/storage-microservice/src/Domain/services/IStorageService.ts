import { Warehouse } from "../models/Warehouse";
import { StoredPackage } from "../models/StoredPackage";

export interface IStorageService {
  sendToSales(count: number): Promise<StoredPackage[]>;
  receivePackage(warehouseId: string, packageData: any): Promise<StoredPackage>;
  listWarehouses(): Promise<Warehouse[]>;
  getWarehousePackages(warehouseId: string): Promise<StoredPackage[]>;
}
