import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users/search", authenticate, authorize("admin"), this.searchUsers.bind(this));
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller", "sales_manager"), this.getUserById.bind(this));
    this.router.put("/users/:id", authenticate, authorize("admin"), this.updateUser.bind(this));
    this.router.delete("/users/:id", authenticate, authorize("admin"), this.deleteUser.bind(this));

    // Production
    this.router.get("/production/plants", authenticate, authorize("admin", "seller", "sales_manager"), this.listProductionPlants.bind(this));
    this.router.post("/production/plant", authenticate, authorize("admin", "seller", "sales_manager"), this.plantNew.bind(this));
    this.router.post("/production/change-strength", authenticate, authorize("admin", "seller", "sales_manager"), this.changeStrength.bind(this));
    this.router.post("/production/harvest", authenticate, authorize("admin", "seller", "sales_manager"), this.harvest.bind(this));

    // Processing
    this.router.get("/processing/perfumes", authenticate, authorize("admin", "seller", "sales_manager"), this.listProcessingPerfumes.bind(this));
    this.router.post("/processing/perfumes", authenticate, authorize("admin", "seller", "sales_manager"), this.createProcessingPerfume.bind(this));

    // Storage
    this.router.post("/storage/send-to-sales", authenticate, authorize("admin", "seller", "sales_manager"), this.sendToSales.bind(this));
    this.router.post("/storage/receive", authenticate, authorize("admin", "seller", "sales_manager"), this.receivePackage.bind(this));
    this.router.get("/storage/warehouses", authenticate, authorize("admin", "seller", "sales_manager"), this.listWarehouses.bind(this));
    this.router.get("/storage/warehouses/:id/packages", authenticate, authorize("admin", "seller", "sales_manager"), this.getWarehousePackages.bind(this));

    // Sales
    this.router.get("/sales/catalog", authenticate, authorize("seller", "sales_manager"), this.getSalesCatalog.bind(this));
    this.router.post("/sales/purchase", authenticate, authorize("seller", "sales_manager"), this.purchaseSales.bind(this));
    this.router.get("/sales/invoices", authenticate, authorize("seller", "sales_manager"), this.listSalesInvoices.bind(this));
    this.router.get("/sales/invoices/:id", authenticate, authorize("seller", "sales_manager"), this.getSalesInvoiceById.bind(this));

    // Audit (admin only)
    this.router.get("/audit/logs/search", authenticate, authorize("admin"), this.searchAuditLogs.bind(this));
    this.router.get("/audit/logs", authenticate, authorize("admin"), this.getAllAuditLogs.bind(this));
    this.router.get("/audit/logs/:id", authenticate, authorize("admin"), this.getAuditLogById.bind(this));
    this.router.post("/audit/logs", authenticate, authorize("admin"), this.createAuditLog.bind(this));
    this.router.put("/audit/logs/:id", authenticate, authorize("admin"), this.updateAuditLog.bind(this));
    this.router.delete("/audit/logs/:id", authenticate, authorize("admin"), this.deleteAuditLog.bind(this));

    // Analytics (admin only)
    this.router.post("/analytics/record-sale", authenticate, authorize("admin"), this.recordAnalyticsSale.bind(this));
    this.router.get("/analytics/sales", authenticate, authorize("admin"), this.getAnalyticsSales.bind(this));
    this.router.get("/analytics/trend", authenticate, authorize("admin"), this.getAnalyticsTrend.bind(this));
    this.router.get("/analytics/top10-perfumes", authenticate, authorize("admin"), this.getAnalyticsTop10Perfumes.bind(this));
    this.router.get("/analytics/top10-revenue", authenticate, authorize("admin"), this.getAnalyticsTop10Revenue.bind(this));
    this.router.post("/analytics/reports/generate", authenticate, authorize("admin"), this.generateAnalyticsReport.bind(this));
    this.router.get("/analytics/reports", authenticate, authorize("admin"), this.listAnalyticsReports.bind(this));
    this.router.get("/analytics/reports/:id", authenticate, authorize("admin"), this.getAnalyticsReportById.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginUserDTO = req.body;
      const result = await this.gatewayService.login(data);
      const status = result.success ? 200 : 401;
      res.status(status).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationUserDTO = req.body;
      const result = await this.gatewayService.register(data);
      const status = result.success ? 201 : 400;
      res.status(status).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      if (!req.user || req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }
      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      const user = await this.gatewayService.updateUser(id, req.body);
      res.status(200).json(user);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const id = parseInt(idParam, 10);
      const result = await this.gatewayService.deleteUser(id);
      res.status(200).json(result);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) ?? "";
      const users = await this.gatewayService.searchUsers(query);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // Production
  private async listProductionPlants(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listProductionPlants();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async plantNew(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.plantNew(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async changeStrength(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.changeStrength(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async harvest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.harvest(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Processing
  private async listProcessingPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listProcessingPerfumes();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async createProcessingPerfume(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.createProcessingPerfume(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Storage
  private async sendToSales(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role ?? "";
      const result = await this.gatewayService.sendToSales(req.body.count, userRole);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async receivePackage(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role ?? "";
      const result = await this.gatewayService.receivePackage(req.body.warehouseId, req.body.packageData, userRole);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role ?? "";
      const result = await this.gatewayService.listWarehouses(userRole);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getWarehousePackages(req: Request, res: Response): Promise<void> {
    try {
      const userRole = req.user?.role ?? "";
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.gatewayService.getWarehousePackages(id, userRole);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Sales
  private async getSalesCatalog(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getSalesCatalog();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async purchaseSales(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.purchaseSales(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listSalesInvoices(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listSalesInvoices();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getSalesInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.gatewayService.getSalesInvoiceById(id);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  // Audit
  private async getAllAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAllAuditLogs();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAuditLogById(req.params.id as string);
      res.status(200).json(result);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async createAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.createAuditLog(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async updateAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.updateAuditLog(req.params.id as string, req.body);
      res.status(200).json(result);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async deleteAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.deleteAuditLog(req.params.id as string);
      res.status(200).json(result);
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async searchAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const query = {
        type: req.query.type as string | undefined,
        keyword: req.query.keyword as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      };
      const result = await this.gatewayService.searchAuditLogs(query);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // Analytics
  private async recordAnalyticsSale(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.recordAnalyticsSale(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAnalyticsSales(req: Request, res: Response): Promise<void> {
    try {
      const criteria = (req.query.criteria as string) ?? "month";
      const result = await this.gatewayService.getAnalyticsSales(criteria);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAnalyticsTrend(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAnalyticsTrend();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAnalyticsTop10Perfumes(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAnalyticsTop10Perfumes();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAnalyticsTop10Revenue(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAnalyticsTop10Revenue();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async generateAnalyticsReport(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.generateAnalyticsReport(req.body.type);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listAnalyticsReports(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.listAnalyticsReports();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAnalyticsReportById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.gatewayService.getAnalyticsReportById(id);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
