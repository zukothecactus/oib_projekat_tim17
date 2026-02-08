import axios, { AxiosInstance } from "axios";
import { IAnalyticsAPI } from "./IAnalyticsAPI";
import {
  SalesByCriteriaDTO,
  SalesTrendDTO,
  Top10PerfumeDTO,
  Top10RevenueDTO,
  AnalyticsReportDTO,
} from "../../models/analytics/AnalyticsDTO";

export class AnalyticsAPI implements IAnalyticsAPI {
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

  async getSalesByCriteria(token: string, criteria: string): Promise<SalesByCriteriaDTO[]> {
    const response = await this.axiosInstance.get("/analytics/sales", {
      params: { criteria },
      headers: this.getAuthHeaders(token),
    });
    return response.data.data ?? [];
  }

  async getSalesTrend(token: string): Promise<SalesTrendDTO[]> {
    const response = await this.axiosInstance.get("/analytics/trend", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data ?? [];
  }

  async getTop10Perfumes(token: string): Promise<Top10PerfumeDTO[]> {
    const response = await this.axiosInstance.get("/analytics/top10-perfumes", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data ?? [];
  }

  async getTop10Revenue(token: string): Promise<Top10RevenueDTO[]> {
    const response = await this.axiosInstance.get("/analytics/top10-revenue", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.data ?? [];
  }

  async generateReport(token: string, type: string): Promise<AnalyticsReportDTO> {
    const response = await this.axiosInstance.post(
      "/analytics/reports/generate",
      { type },
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.report;
  }

  async listReports(token: string): Promise<AnalyticsReportDTO[]> {
    const response = await this.axiosInstance.get("/analytics/reports", {
      headers: this.getAuthHeaders(token),
    });
    return response.data.list ?? [];
  }

  async getReportById(token: string, id: string): Promise<AnalyticsReportDTO> {
    const response = await this.axiosInstance.get(`/analytics/reports/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return response.data.report;
  }
}
