import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IPackagingAPI } from "./IPackagingAPI";
import { PackageDTO } from "../../models/packaging/PackageDTO";

export class PackagingAPI implements IPackagingAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async packPerfumes(
    data: { name: string; senderAddress: string; perfumeType: string; count: number; perfumeIds?: string[] },
    token: string
  ): Promise<PackageDTO> {
    const response: AxiosResponse<{ package: PackageDTO }> = await this.axiosInstance.post(
      "/packaging/pack",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.package;
  }

  async sendToWarehouse(
    data: { packageId: string; warehouseId: string },
    token: string
  ): Promise<PackageDTO> {
    const response: AxiosResponse<{ package: PackageDTO }> = await this.axiosInstance.post(
      "/packaging/send",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.package;
  }

  async listPackages(token: string): Promise<PackageDTO[]> {
    const response: AxiosResponse<{ list: PackageDTO[] }> = await this.axiosInstance.get(
      "/packaging/packages",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async getPackageById(id: string, token: string): Promise<PackageDTO> {
    const response: AxiosResponse<{ package: PackageDTO }> = await this.axiosInstance.get(
      `/packaging/packages/${id}`,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.package;
  }
}
