import axios, { AxiosInstance } from "axios";
import { IPerformanceAPI } from "./IPerformanceAPI";
import { SimulationResultDTO, PerformanceReportDTO } from "../../models/performance/PerformanceDTO";

export class PerformanceAPI implements IPerformanceAPI {
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

  async runSimulation(token: string, packageCount: number): Promise<SimulationResultDTO> {
    const response = await this.axiosInstance.post(
      "/performance/simulate",
      { packageCount },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.data;
  }

  async listReports(token: string): Promise<PerformanceReportDTO[]> {
    const response = await this.axiosInstance.get("/performance/reports", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.list ?? [];
  }

  async getReportById(token: string, id: string): Promise<PerformanceReportDTO> {
    const response = await this.axiosInstance.get(`/performance/reports/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.report;
  }
}
