import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly packagingClient: AxiosInstance;
  private readonly storageClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;
  private readonly auditClient: AxiosInstance;
  private readonly analyticsClient: AxiosInstance;
  private readonly performanceClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const packagingBaseURL = process.env.PACKAGING_SERVICE_API;
    const storageBaseURL = process.env.STORAGE_SERVICE_API;
    const salesBaseURL = process.env.SALES_SERVICE_API;
    const auditBaseURL = process.env.AUDIT_SERVICE_API;
    const analyticsBaseURL = process.env.ANALYTICS_SERVICE_API;
    const performanceBaseURL = process.env.PERFORMANCE_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.productionClient = axios.create({
      baseURL: productionBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.packagingClient = axios.create({
      baseURL: packagingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    this.storageClient = axios.create({
      baseURL: storageBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.auditClient = axios.create({
      baseURL: auditBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.analyticsClient = axios.create({
      baseURL: analyticsBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    this.performanceClient = axios.create({
      baseURL: performanceBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Auth service unavailable" };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: "Auth service unavailable" };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: any): Promise<UserDTO> {
    const response = await this.userClient.put<UserDTO>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<any> {
    const response = await this.userClient.delete(`/users/${id}`);
    return response.data;
  }

  async searchUsers(query: string): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>(`/users/search`, {
      params: { q: query },
    });
    return response.data;
  }

  // Production microservice
  async listProductionPlants(): Promise<any> {
    const response = await this.productionClient.get("/production/plants");
    return response.data;
  }

  async plantNew(data: { commonName: string; latinName: string; originCountry: string }): Promise<any> {
    const response = await this.productionClient.post("/production/plant", data);
    return response.data;
  }

  async changeStrength(data: { plantId: string; percent: number }): Promise<any> {
    const response = await this.productionClient.post("/production/change-strength", data);
    return response.data;
  }

  async harvest(data: { latinName: string; count: number }): Promise<any> {
    const response = await this.productionClient.post("/production/harvest", data);
    return response.data;
  }

  // Processing microservice
  async listProcessingPerfumes(): Promise<any> {
    const response = await this.processingClient.get("/processing/perfumes");
    return response.data;
  }

  async createProcessingPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber?: string;
    expiresAt: string;
    status?: string;
    plantId?: string;
  }): Promise<any> {
    const response = await this.processingClient.post("/processing/perfumes", data);
    return response.data;
  }

  async startProcessing(data: {
    perfumeName: string;
    perfumeType: string;
    bottleCount: number;
    bottleVolume: number;
    latinName: string;
  }): Promise<any> {
    const response = await this.processingClient.post("/processing/start-processing", data);
    return response.data;
  }

  async getAvailablePerfumes(type: string, count: number): Promise<any> {
    const response = await this.processingClient.get("/processing/perfumes/available", {
      params: { type, count },
  // Storage microservice
  async sendToSales(count: number, userRole: string): Promise<any> {
    const response = await this.storageClient.post("/storage/send-to-sales", { count }, {
      headers: { "X-User-Role": userRole },
    });
    return response.data;
  }

  async receivePackage(warehouseId: string, packageData: any, userRole: string): Promise<any> {
    const response = await this.storageClient.post("/storage/receive", { warehouseId, packageData }, {
      headers: { "X-User-Role": userRole },
    });
    return response.data;
  }

  async listWarehouses(userRole: string): Promise<any> {
    const response = await this.storageClient.get("/storage/warehouses", {
      headers: { "X-User-Role": userRole },
    });
    return response.data;
  }

  // Packaging microservice
  async packPerfumes(data: { name: string; senderAddress: string; perfumeType: string; count: number; perfumeIds?: string[] }): Promise<any> {
    const response = await this.packagingClient.post("/packaging/pack", data);
    return response.data;
  }

  async sendToWarehouse(data: { packageId: string; warehouseId: string }): Promise<any> {
    const response = await this.packagingClient.post("/packaging/send", data);
    return response.data;
  }

  async listPackages(): Promise<any> {
    const response = await this.packagingClient.get("/packaging/packages");
    return response.data;
  }

  async getPackageById(id: string): Promise<any> {
    const response = await this.packagingClient.get(`/packaging/packages/${id}`);
  async getWarehousePackages(warehouseId: string, userRole: string): Promise<any> {
    const response = await this.storageClient.get(`/storage/warehouses/${warehouseId}/packages`, {
      headers: { "X-User-Role": userRole },
    });
    return response.data;
  }

  // Sales microservice
  async getSalesCatalog(): Promise<any> {
    const response = await this.salesClient.get("/sales/catalog");
    return response.data;
  }

  async purchaseSales(data: { items: { perfumeId: string; quantity: number }[]; saleType: string; paymentMethod: string }): Promise<any> {
    const response = await this.salesClient.post("/sales/purchase", data);
    return response.data;
  }

  async listSalesInvoices(): Promise<any> {
    const response = await this.salesClient.get("/sales/invoices");
    return response.data;
  }

  async getSalesInvoiceById(id: string): Promise<any> {
    const response = await this.salesClient.get(`/sales/invoices/${id}`);
    return response.data;
  }

  // Audit microservice
  async getAllAuditLogs(): Promise<any[]> {
    const response = await this.auditClient.get("/audit/logs");
    return response.data;
  }

  async getAuditLogById(id: string): Promise<any> {
    const response = await this.auditClient.get(`/audit/logs/${id}`);
    return response.data;
  }

  async createAuditLog(data: { type: string; description: string }): Promise<any> {
    const response = await this.auditClient.post("/audit/logs", data);
    return response.data;
  }

  async updateAuditLog(id: string, data: { type?: string; description?: string }): Promise<any> {
    const response = await this.auditClient.put(`/audit/logs/${id}`, data);
    return response.data;
  }

  async deleteAuditLog(id: string): Promise<any> {
    const response = await this.auditClient.delete(`/audit/logs/${id}`);
    return response.data;
  }

  async searchAuditLogs(query: { type?: string; keyword?: string; dateFrom?: string; dateTo?: string }): Promise<any[]> {
    const response = await this.auditClient.get("/audit/logs/search", { params: query });
    return response.data;
  }

  // Analytics microservice
  async recordAnalyticsSale(data: any): Promise<any> {
    const response = await this.analyticsClient.post("/analytics/record-sale", data);
    return response.data;
  }

  async getAnalyticsSales(criteria: string): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/sales", { params: { criteria } });
    return response.data;
  }

  async getAnalyticsTrend(): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/trend");
    return response.data;
  }

  async getAnalyticsTop10Perfumes(): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/top10-perfumes");
    return response.data;
  }

  async getAnalyticsTop10Revenue(): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/top10-revenue");
    return response.data;
  }

  async generateAnalyticsReport(type: string): Promise<any> {
    const response = await this.analyticsClient.post("/analytics/reports/generate", { type });
    return response.data;
  }

  async listAnalyticsReports(): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/reports");
    return response.data;
  }

  async getAnalyticsReportById(id: string): Promise<any> {
    const response = await this.analyticsClient.get(`/analytics/reports/${id}`);
    return response.data;
  }

  // Performance microservice
  async runPerformanceSimulation(packageCount: number): Promise<any> {
    const response = await this.performanceClient.post("/performance/simulate", { packageCount });
    return response.data;
  }

  async listPerformanceReports(): Promise<any> {
    const response = await this.performanceClient.get("/performance/reports");
    return response.data;
  }

  async getPerformanceReportById(id: string): Promise<any> {
    const response = await this.performanceClient.get(`/performance/reports/${id}`);
    return response.data;
  }
}
