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
  private readonly auditClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const auditBaseURL = process.env.AUDIT_SERVICE_API;

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

    this.auditClient = axios.create({
      baseURL: auditBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
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
  }): Promise<any> {
    const response = await this.processingClient.post("/processing/perfumes", data);
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
}
