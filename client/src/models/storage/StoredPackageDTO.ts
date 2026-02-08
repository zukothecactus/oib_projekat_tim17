export interface StoredPackageDTO {
  id: string;
  packageId: string;
  warehouseId: string;
  packageData: any;
  isDispatched: boolean;
  receivedAt: string;
}
