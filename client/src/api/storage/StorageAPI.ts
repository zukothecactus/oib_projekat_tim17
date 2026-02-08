import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IStorageAPI } from "./IStorageAPI";
import { WarehouseDTO } from "../../models/storage/WarehouseDTO";
import { StoredPackageDTO } from "../../models/storage/StoredPackageDTO";

export class StorageAPI implements IStorageAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async listWarehouses(token: string): Promise<WarehouseDTO[]> {
    const response: AxiosResponse<{ list: WarehouseDTO[] }> = await this.axiosInstance.get(
      "/storage/warehouses",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async getWarehousePackages(warehouseId: string, token: string): Promise<StoredPackageDTO[]> {
    const response: AxiosResponse<{ list: StoredPackageDTO[] }> = await this.axiosInstance.get(
      `/storage/warehouses/${warehouseId}/packages`,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async receivePackage(warehouseId: string, packageData: any, token: string): Promise<StoredPackageDTO> {
    const response: AxiosResponse<{ stored: StoredPackageDTO }> = await this.axiosInstance.post(
      "/storage/receive",
      { warehouseId, packageData },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.stored;
  }

  async sendToSales(count: number, token: string): Promise<StoredPackageDTO[]> {
    const response: AxiosResponse<{ dispatched: StoredPackageDTO[] }> = await this.axiosInstance.post(
      "/storage/send-to-sales",
      { count },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.dispatched ?? [];
  }
}
