export type PackageDTO = {
  id: string;
  name: string;
  senderAddress: string;
  warehouseId: string | null;
  perfumeIds: string[];
  status: string;
  createdAt: string;
};
