import { Request, Response, Router } from 'express';
import { IPackagingService } from '../../Domain/services/IPackagingService';
import { validatePackPerfumes, validateSendToWarehouse } from '../validators/PackagingValidators';

export class PackagingController {
  private router: Router;
  private readonly service: IPackagingService;

  constructor(service: IPackagingService) {
    this.router = Router();
    this.service = service;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/packaging/pack', this.packPerfumes.bind(this));
    this.router.post('/packaging/send', this.sendToWarehouse.bind(this));
    this.router.get('/packaging/packages', this.listPackages.bind(this));
    this.router.get('/packaging/packages/:id', this.getPackageById.bind(this));
  }

  private async packPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validatePackPerfumes(data);
      if (!v.success) { res.status(400).json(v); return; }

      const pkg = await this.service.packPerfumes({
        name: data.name,
        senderAddress: data.senderAddress,
        perfumeType: data.perfumeType,
        count: data.count,
        perfumeIds: data.perfumeIds,
      });
      res.status(201).json({ success: true, package: pkg });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error';
      const isBusinessError =
        message.includes('Nedovoljno dostupnih parfema') ||
        message.includes('Parfemi su vec spakovani');
      res.status(isBusinessError ? 400 : 500).json({ success: false, message });
    }
  }

  private async sendToWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const v = validateSendToWarehouse(data);
      if (!v.success) { res.status(400).json(v); return; }

      const pkg = await this.service.sendToWarehouse(data.packageId, data.warehouseId);
      res.status(200).json({ success: true, package: pkg });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error';
      const isBusinessError =
        message.includes('Nema dostupnih ambalaza') ||
        message.includes('nije pronadjena') ||
        message.includes('vec poslata') ||
        message.includes('vec dodeljena');
      res.status(isBusinessError ? 400 : 500).json({ success: false, message });
    }
  }

  private async listPackages(req: Request, res: Response): Promise<void> {
    try {
      const list = await this.service.listPackages();
      res.status(200).json({ success: true, list });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async getPackageById(req: Request, res: Response): Promise<void> {
    try {
      const pkg = await this.service.getPackageById(req.params.id);
      res.status(200).json({ success: true, package: pkg });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error';
      const isNotFound = message.includes('nije pronadjena');
      res.status(isNotFound ? 404 : 500).json({ success: false, message });
    }
  }

  public getRouter(): Router { return this.router; }
}
