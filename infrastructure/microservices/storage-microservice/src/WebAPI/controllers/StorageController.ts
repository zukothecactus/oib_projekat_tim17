import { Request, Response, Router } from "express";
import { Repository } from "typeorm";
import { Warehouse } from "../../Domain/models/Warehouse";
import { StoredPackage } from "../../Domain/models/StoredPackage";
import { IStorageService } from "../../Domain/services/IStorageService";
import { DistributionCenterService } from "../../Services/DistributionCenterService";
import { WarehouseCenterService } from "../../Services/WarehouseCenterService";
import { sendAuditLog } from "../../utils/AuditClient";

export class StorageController {
  private readonly router: Router;

  constructor(
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly storedPkgRepo: Repository<StoredPackage>
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Dependency injection based on user role (X-User-Role header).
   * SALES_MANAGER → DistributionCenterService (up to 3 packages, 0.5s delay each)
   * Other roles   → WarehouseCenterService   (exactly 1 package, 2.5s delay)
   */
  private getService(req: Request): IStorageService {
    const role = req.headers['x-user-role'] as string;
    const service: IStorageService = role === 'SALES_MANAGER'
      ? new DistributionCenterService(this.warehouseRepo, this.storedPkgRepo)
      : new WarehouseCenterService(this.warehouseRepo, this.storedPkgRepo);
    return service;
  }

  private initializeRoutes(): void {
    this.router.post("/storage/send-to-sales", this.sendToSales.bind(this));
    this.router.post("/storage/receive", this.receivePackage.bind(this));
    this.router.get("/storage/warehouses", this.listWarehouses.bind(this));
    this.router.get("/storage/warehouses/:id/packages", this.getWarehousePackages.bind(this));
  }

  private async sendToSales(req: Request, res: Response): Promise<void> {
    try {
      const service = this.getService(req);
      const { count } = req.body;
      const dispatched = await service.sendToSales(count ?? 1);
      res.status(200).json({ success: true, dispatched });
    } catch (err) {
      sendAuditLog('ERROR', `Skladiste: greska pri slanju na prodaju — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async receivePackage(req: Request, res: Response): Promise<void> {
    try {
      const service = this.getService(req);
      const { warehouseId, packageData } = req.body;
      const stored = await service.receivePackage(warehouseId, packageData);
      res.status(201).json({ success: true, stored });
    } catch (err) {
      sendAuditLog('ERROR', `Skladiste: greska pri prijemu ambalaze — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const service = this.getService(req);
      const warehouses = await service.listWarehouses();
      res.status(200).json({ success: true, list: warehouses });
    } catch (err) {
      sendAuditLog('ERROR', `Skladiste: greska pri dohvatanju skladista — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getWarehousePackages(req: Request, res: Response): Promise<void> {
    try {
      const service = this.getService(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const packages = await service.getWarehousePackages(id);
      res.status(200).json({ success: true, list: packages });
    } catch (err) {
      sendAuditLog('ERROR', `Skladiste: greska pri dohvatanju ambalaza iz skladista — ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
