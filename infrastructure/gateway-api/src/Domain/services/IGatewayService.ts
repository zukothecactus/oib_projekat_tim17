import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  updateUser(id: number, data: any): Promise<UserDTO>;
  deleteUser(id: number): Promise<any>;
  searchUsers(query: string): Promise<UserDTO[]>;

  // Production
  listProductionPlants(): Promise<any>;
  plantNew(data: { commonName: string; latinName: string; originCountry: string }): Promise<any>;
  changeStrength(data: { plantId: string; percent: number }): Promise<any>;
  harvest(data: { latinName: string; count: number }): Promise<any>;

  // Processing
  listProcessingPerfumes(): Promise<any>;
  createProcessingPerfume(data: {
    name: string;
    type: string;
    volume: number;
    serialNumber?: string;
    expiresAt: string;
    status?: string;
  }): Promise<any>;

  // Storage
  sendToSales(count: number, userRole: string): Promise<any>;
  receivePackage(warehouseId: string, packageData: any, userRole: string): Promise<any>;
  listWarehouses(userRole: string): Promise<any>;
  getWarehousePackages(warehouseId: string, userRole: string): Promise<any>;
  // Sales
  getSalesCatalog(): Promise<any>;
  purchaseSales(data: { items: { perfumeId: string; quantity: number }[]; saleType: string; paymentMethod: string }): Promise<any>;
  listSalesInvoices(): Promise<any>;
  getSalesInvoiceById(id: string): Promise<any>;

  // Audit
  getAllAuditLogs(): Promise<any[]>;
  getAuditLogById(id: string): Promise<any>;
  createAuditLog(data: { type: string; description: string }): Promise<any>;
  updateAuditLog(id: string, data: { type?: string; description?: string }): Promise<any>;
  deleteAuditLog(id: string): Promise<any>;
  searchAuditLogs(query: { type?: string; keyword?: string; dateFrom?: string; dateTo?: string }): Promise<any[]>;

  // Analytics
  recordAnalyticsSale(data: any): Promise<any>;
  getAnalyticsSales(criteria: string): Promise<any>;
  getAnalyticsTrend(): Promise<any>;
  getAnalyticsTop10Perfumes(): Promise<any>;
  getAnalyticsTop10Revenue(): Promise<any>;
  generateAnalyticsReport(type: string): Promise<any>;
  listAnalyticsReports(): Promise<any>;
  getAnalyticsReportById(id: string): Promise<any>;

  // Performance
  runPerformanceSimulation(packageCount: number): Promise<any>;
  listPerformanceReports(): Promise<any>;
  getPerformanceReportById(id: string): Promise<any>;
}
