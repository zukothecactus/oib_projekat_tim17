import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IProcessingAPI } from "./IProcessingAPI";
import { PerfumeDTO } from "../../models/processing/PerfumeDTO";

export class ProcessingAPI implements IProcessingAPI {
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

  async listPerfumes(token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ list: PerfumeDTO[] }> = await this.axiosInstance.get(
      "/processing/perfumes",
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }

  async createPerfume(
    data: {
      name: string;
      type: string;
      volume: number;
      serialNumber?: string;
      expiresAt: string;
      status?: string;
      plantId?: string;
    },
    token: string
  ): Promise<PerfumeDTO> {
    const response: AxiosResponse<{ perfume: PerfumeDTO }> = await this.axiosInstance.post(
      "/processing/perfumes",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.perfume;
  }

  async startProcessing(
    data: {
      perfumeName: string;
      perfumeType: string;
      bottleCount: number;
      bottleVolume: number;
      latinName: string;
    },
    token: string
  ): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ perfumes: PerfumeDTO[] }> = await this.axiosInstance.post(
      "/processing/start-processing",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.perfumes ?? [];
  }

  async getAvailablePerfumes(
    type: string,
    count: number,
    token: string
  ): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ list: PerfumeDTO[] }> = await this.axiosInstance.get(
      "/processing/perfumes/available",
      { params: { type, count }, headers: this.getAuthHeaders(token) }
    );
    return response.data.list ?? [];
  }
}
