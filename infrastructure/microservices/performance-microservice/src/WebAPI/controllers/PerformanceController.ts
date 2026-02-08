import { Request, Response, Router } from "express";
import { IPerformanceService } from "../../Domain/services/IPerformanceService";

export class PerformanceController {
  private readonly router: Router;

  constructor(private readonly service: IPerformanceService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/performance/simulate", this.runSimulation.bind(this));
    this.router.get("/performance/reports", this.listReports.bind(this));
    this.router.get("/performance/reports/:id", this.getReportById.bind(this));
  }

  private async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      const { packageCount } = req.body;
      if (!packageCount || typeof packageCount !== "number" || packageCount < 1) {
        res.status(400).json({ success: false, message: "Unesite validan broj ambalaža (packageCount >= 1)." });
        return;
      }
      const result = await this.service.runSimulation({ packageCount });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listReports(_req: Request, res: Response): Promise<void> {
    try {
      const list = await this.service.listReports();
      res.status(200).json({ success: true, list });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const report = await this.service.getReportById(id);
      if (!report) {
        res.status(404).json({ success: false, message: "Izveštaj nije pronađen." });
        return;
      }
      res.status(200).json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
