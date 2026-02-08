export type PackageStatus = "SPAKOVANA" | "POSLATA";

export type PackageDTO = {
  id: string;
  name: string;
  senderAddress: string;
  warehouseId: string | null;
  perfumeIds: string[];
  status: PackageStatus;
  createdAt: string;
};
