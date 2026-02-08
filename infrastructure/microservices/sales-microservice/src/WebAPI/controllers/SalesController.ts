import { Request, Response, Router } from "express";
import { ISalesService } from "../../Domain/services/ISalesService";

export class SalesController {
  private readonly router: Router;

  constructor(private readonly service: ISalesService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/sales/catalog", this.getCatalog.bind(this));
    this.router.post("/sales/purchase", this.purchase.bind(this));
    this.router.get("/sales/invoices", this.listInvoices.bind(this));
    this.router.get("/sales/invoices/:id", this.getInvoiceById.bind(this));
  }

  private async getCatalog(_req: Request, res: Response): Promise<void> {
    try {
      const catalog = await this.service.getCatalog();
      res.status(200).json({ success: true, list: catalog });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async purchase(req: Request, res: Response): Promise<void> {
    try {
      const { items, saleType, paymentMethod } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ success: false, message: "Stavke su obavezne." });
        return;
      }
      if (!saleType || !paymentMethod) {
        res.status(400).json({ success: false, message: "Tip prodaje i način plaćanja su obavezni." });
        return;
      }

      const invoice = await this.service.purchase({ items, saleType, paymentMethod });
      res.status(201).json({ success: true, invoice });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async listInvoices(_req: Request, res: Response): Promise<void> {
    try {
      const list = await this.service.listInvoices();
      res.status(200).json({ success: true, list });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const invoice = await this.service.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: "Faktura nije pronađena." });
        return;
      }
      res.status(200).json({ success: true, invoice });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
