import { Request, Response, Router } from "express";
import { IAnalyticsService } from "../../Domain/services/IAnalyticsService";
import { ReportType } from "../../Domain/enums/ReportType";

export class AnalyticsController {
  private readonly router: Router;

  constructor(private readonly service: IAnalyticsService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/analytics/record-sale", this.recordSale.bind(this));
    this.router.get("/analytics/sales", this.getSalesByCriteria.bind(this));
    this.router.get("/analytics/trend", this.getSalesTrend.bind(this));
    this.router.get("/analytics/top10-perfumes", this.getTop10Perfumes.bind(this));
    this.router.get("/analytics/top10-revenue", this.getTop10Revenue.bind(this));
    this.router.post("/analytics/reports/generate", this.generateReport.bind(this));
    this.router.get("/analytics/reports", this.listReports.bind(this));
    this.router.get("/analytics/reports/:id", this.getReportById.bind(this));
  }

  private async recordSale(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId, saleType, paymentMethod, items, totalAmount, saleDate } = req.body;
      if (!invoiceId || !items || !totalAmount) {
        res.status(400).json({ success: false, message: "Nedostaju obavezna polja." });
        return;
      }
      await this.service.recordSale({
        invoiceId,
        saleType,
        paymentMethod,
        items,
        totalAmount,
        saleDate: saleDate ?? new Date().toISOString(),
      });
      res.status(201).json({ success: true, message: "Prodaja zabeležena." });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getSalesByCriteria(req: Request, res: Response): Promise<void> {
    try {
      const criteria = (req.query.criteria as string) ?? "month";
      const validCriteria = ["month", "week", "year", "total"];
      if (!validCriteria.includes(criteria)) {
        res.status(400).json({ success: false, message: "Nevažeći kriterijum. Koristite: month, week, year, total." });
        return;
      }
      const data = await this.service.getSalesByCriteria(criteria as any);
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getSalesTrend(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getSalesTrend();
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getTop10Perfumes(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getTop10Perfumes();
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getTop10Revenue(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getTop10Revenue();
      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.body;
      if (!type || !Object.values(ReportType).includes(type)) {
        res.status(400).json({ success: false, message: "Nevažeći tip izveštaja." });
        return;
      }
      const report = await this.service.generateReport(type);
      res.status(201).json({ success: true, report });
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
